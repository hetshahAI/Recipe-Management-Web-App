import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const AIRecipeGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cuisineTypes = [
    'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 'Japanese', 
    'Thai', 'Mediterranean', 'American', 'Korean', 'Greek', 'Spanish'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a recipe idea',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // forward the user's access token to the Edge Function so it can tie created recipe to the user if desired
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = (sessionData as any)?.session?.access_token;

      const invokeOptions: any = {
        body: { prompt: prompt.trim(), cuisine: selectedCuisine }
      };
      if (imageData) invokeOptions.body.image_data = imageData;
      if (accessToken) invokeOptions.headers = { Authorization: `Bearer ${accessToken}` };

      const { data, error } = await supabase.functions.invoke('generate-recipe', invokeOptions);
      if (error) throw error;

      if (data && data.success) {
        toast({ title: 'Success!', description: data.message });
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        setIsOpen(false);
        setPrompt('');
        setSelectedCuisine('');
        setImageData(null);
      } else {
        // If function returned raw payload for debug, include it
        const raw = data?.raw ? ` — raw: ${String(data.raw).slice(0, 200)}` : '';
        throw new Error((data && data.error) ? `${data.error}${raw}` : 'Failed to generate recipe');
      }
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      toast({ title: 'Error', description: `Failed to generate recipe: ${error.message || String(error)}`, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="text-white">
          <Bot className="mr-2 h-4 w-4" />
          AI Recipe Generator
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Recipe Generator
          </DialogTitle>
          <DialogDescription>
            Describe what you want to cook and our AI will create a complete recipe for you!
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">What would you like to cook?</CardTitle>
            <CardDescription>
              Be as specific or creative as you want!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="e.g., Spicy chicken pasta with garlic and herbs"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Attach an image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSelectedFile(file);
                  const reader = new FileReader();
                  reader.onload = () => setImageData(String(reader.result));
                  reader.readAsDataURL(file);
                }}
                disabled={isGenerating}
              />
              {imageData && (
                <img src={imageData} alt="preview" className="mt-2 max-h-40 object-contain" />
              )}
            </div>
            
            <div>
              <Select 
                value={selectedCuisine} 
                onValueChange={setSelectedCuisine}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine style (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate}
              className="w-full"
              variant="recipe"
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Recipe...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Recipe
                </>
              )}
            </Button>
            {imageData && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={async () => {
                  // image-based generation using local classifier + templates
                  if (!imageData) return;
                  setIsGenerating(true);
                  try {
                    const classify = (await import('@/lib/imageClassifier')).default;
                    const getTemplate = (await import('@/lib/recipeTemplates')).default;
                    const results = await classify(imageData);
                    if (!results || results.length === 0) {
                      throw new Error('No labels detected');
                    }
                    const top = results[0];
                    const label = top.label.toLowerCase();
                    const template = getTemplate(label);
                    if (!template || Object.keys(template).length === 0) {
                      throw new Error(`No recipe template for detected label: ${top.label}`);
                    }

                    // upload the selectedFile (if available) to Supabase Storage
                    let publicUrl: string | null = null;
                    if (selectedFile) {
                      const ext = selectedFile.name.split('.').pop() || 'jpg';
                      const filePath = `recipes/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
                      const { data: up, error: upErr } = await supabase.storage.from('public').upload(filePath, selectedFile as File);
                      if (upErr) console.warn('Storage upload error', upErr);
                      else {
                        const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath);
                        publicUrl = urlData.publicUrl || (urlData as any).public_url || null;
                      }
                    }

                    // build payload from template
                    const { data: userData } = await supabase.auth.getUser();
                    const userId = userData?.user?.id ?? null;
                    const rawDifficulty = template.difficulty || 'easy';
                    const diff = String(rawDifficulty).toLowerCase();
                    const allowed = ['easy', 'medium', 'hard'];
                    const difficulty = allowed.includes(diff) ? diff : 'easy';

                    const recipePayload: any = {
                      title: template.title || (prompt || 'Image Recipe').slice(0, 100),
                      description: template.description || '',
                      cuisine: template.cuisine || selectedCuisine || null,
                      prep_time: template.prep_time ?? null,
                      cook_time: template.cook_time ?? null,
                      servings: template.servings ?? null,
                      difficulty,
                      ingredients: template.ingredients || [],
                      instructions: template.instructions || [],
                      image_url: publicUrl,
                    };
                    if (userId) recipePayload.user_id = userId;

                    const { data: insertData, error: insertErr } = await supabase.from('recipes').insert([recipePayload]).select().single();
                    if (insertErr) throw insertErr;
                    queryClient.invalidateQueries({ queryKey: ['recipes'] });
                    toast({ title: 'Recipe created', description: 'Recipe generated from image' });
                    setIsOpen(false);
                    setPrompt('');
                    setSelectedCuisine('');
                    setImageData(null);
                    setSelectedFile(null);
                  } catch (e: any) {
                    console.error('Image generation failed', e);
                    toast({ title: 'Error', description: `Image generation: ${e.message || String(e)}`, variant: 'destructive' });
                  } finally {
                    setIsGenerating(false);
                  }
                }}
              >
                Generate From Image
              </Button>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};