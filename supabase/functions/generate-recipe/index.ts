import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { prompt, cuisine } = await req.json();

    if (!prompt) {
      throw new Error('Recipe prompt is required');
    }

    const deepseekApiKey = Deno.env.get('OPENAI_API_KEY'); // Using same secret name for DeepSeek key
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    console.log('Generating recipe for prompt:', prompt);

    // Call DeepSeek API to generate recipe
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional chef and recipe creator. Generate a complete, detailed recipe based on the user's request. Return ONLY a valid JSON object with this exact structure:

{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "cuisine": "Cuisine type (e.g., Italian, Mexican, etc.)",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "Easy/Medium/Hard",
  "ingredients": [
    "1 cup flour",
    "2 eggs",
    "1/2 cup milk"
  ],
  "instructions": [
    "Preheat oven to 350°F",
    "Mix dry ingredients in a bowl",
    "Add wet ingredients and stir"
  ]
}`
          },
          {
            role: 'user',
            content: `Create a recipe for: ${prompt}${cuisine ? ` (${cuisine} cuisine style)` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content.trim();
    
    console.log('AI Response:', content);

    let recipeData;
    try {
      // Try to parse the JSON response
      recipeData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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