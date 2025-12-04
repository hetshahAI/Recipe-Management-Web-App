// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
declare const Deno: any;
declare function atob(s: string): string;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, cuisine, image_data } = body;

    if (!prompt) {
      throw new Error('Recipe prompt is required');
    }

    // Use configurable AI endpoint + key so we don't hardcode a provider here
    // Support configurable AI endpoint; default to OpenRouter-compatible endpoint if not provided
    const AI_API_URL = Deno.env.get('AI_API_URL') || 'https://api.openrouter.ai/v1/chat/completions';
    const AI_API_KEY = Deno.env.get('AI_API_KEY');
    if (!AI_API_KEY) {
      throw new Error('AI API key not configured');
    }

    console.log('Generating recipe for prompt:', prompt);

    const systemPrompt = `You are a professional chef and recipe creator. Generate a complete, detailed recipe based on the user's request. Return ONLY a valid JSON object with exactly the following keys: title (string), description (string), cuisine (string), prep_time (number), cook_time (number), servings (number), difficulty (string), ingredients (array of strings), instructions (array of strings). Do NOT include any extra commentary or markdown.`;
    const userMessage = `Create a recipe for: ${prompt}${cuisine ? ` (${cuisine} cuisine style)` : ''}`;

    // Try the AI request with retries because free keys (OpenRouter) can be flaky
    let aiJson: any = null;
    let aiContentRaw: string | undefined = undefined;
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const aiResponse = await fetch(AI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 1500
          }),
        });

        if (!aiResponse.ok) {
          const err = await aiResponse.text();
          console.warn(`AI API attempt ${attempt} failed:`, err);
          // small backoff before retrying
          if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }

        aiJson = await aiResponse.json();
        // extract raw content string for parsing/fallback
        aiContentRaw = aiJson?.choices?.[0]?.message?.content ?? aiJson?.result?.output_text ?? aiJson?.result?.[0]?.content ?? aiJson?.text ?? (typeof aiJson === 'string' ? aiJson : undefined);
        if (!aiContentRaw) {
          console.warn('AI returned no text content on attempt', attempt, aiJson);
          if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }

        break; // success
      } catch (e) {
        console.warn(`AI request attempt ${attempt} error:`, e);
        if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    if (!aiJson && !aiContentRaw) {
      console.error('AI API failed after retries');
      throw new Error('AI API failed after retries');
    }

    // OpenRouter may place the assistant text in different keys; support common shapes
    let content: string | undefined = undefined;
    if (aiJson?.choices?.[0]?.message?.content) content = aiJson.choices[0].message.content;
    else if (aiJson?.result?.output_text) content = aiJson.result.output_text;
    else if (aiJson?.result?.[0]?.content) content = aiJson.result[0].content;
    else if (typeof aiJson === 'string') content = aiJson;
    else if (aiJson?.text) content = aiJson.text;

    if (!content) {
      console.error('AI returned unexpected payload', aiJson);
      throw new Error('Empty response from AI');
    }

    let recipeData: any = undefined;
    try {
      recipeData = JSON.parse(content.trim());
    } catch (parseError) {
      // Try to extract JSON object from the text body as a fallback
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { recipeData = JSON.parse(match[0]); } catch (e) { /* ignore */ }
      }
    }

    // If parsing failed, fall back to creating a draft recipe that contains the raw AI output
    let usedFallback = false;
    if (!recipeData) {
      usedFallback = true;
      const title = (prompt && prompt.length > 0) ? (prompt.slice(0, 60) + (prompt.length > 60 ? '...' : '')) : 'AI Recipe Draft';
      recipeData = {
        title: `${title} (AI draft)`,
        description: `Auto-generated draft. The AI output could not be parsed as structured JSON. Raw output is included in instructions.`,
        cuisine: cuisine || null,
        prep_time: null,
        cook_time: null,
        servings: null,
        difficulty: 'Unknown',
        ingredients: [],
        instructions: [String(content || aiContentRaw || '').slice(0, 2000)],
      };
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If an image data URL was provided, upload it to Supabase Storage (bucket: 'public')
    if (image_data) {
      try {
        const m = String(image_data).match(/^data:(.+);base64,(.*)$/);
        if (m) {
          const mime = m[1];
          const b64 = m[2];
          const binary = atob(b64);
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
          const ext = (mime.split('/')[1] || 'png').split('+')[0];
          const filePath = `recipes/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage.from('public').upload(filePath, bytes, { contentType: mime });
          if (uploadErr) {
            console.error('Storage upload error:', uploadErr);
          } else {
            const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath);
            recipeData.image_url = urlData.publicUrl || urlData?.public_url || `/${filePath}`;
          }
        } else {
          // Not a data URL, just store whatever was provided
          recipeData.image_url = image_data;
        }
      } catch (e) {
        console.error('Error uploading image to storage:', e);
      }
    }

    // If an Authorization header with a JWT was provided, try to extract the user id
    try {
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
      if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        const token = authHeader.split(' ')[1];
        // decode JWT payload without verifying (we only extract sub)
        const parts = token.split('.');
        if (parts.length >= 2) {
          try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const userId = payload?.sub || payload?.user_id || payload?.uid;
            if (userId && !recipeData.user_id) {
              recipeData.user_id = userId;
              console.log('Attaching user_id to recipe:', userId);
            }
          } catch (e) {
            console.warn('Failed to decode JWT payload for user attribution', e);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading Authorization header for user attribution', e);
    }

    // Insert the recipe into the database
    const { data: newRecipe, error: insertError } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save recipe: ${insertError.message}`);
    }

    console.log('Recipe created successfully:', newRecipe);

    return new Response(JSON.stringify({
      success: true,
      recipe: newRecipe,
      message: 'Recipe generated and saved successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});