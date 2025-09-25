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
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { 
          prompt: prompt.trim(),
          cuisine: selectedCuisine 
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success!',
          description: data.message,
        });
        
        // Refresh the recipes list
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        
        // Close dialog and reset form
        setIsOpen(false);
        setPrompt('');
        setSelectedCuisine('');
      } else {
        throw new Error(data.error || 'Failed to generate recipe');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Error',
        description: `Failed to generate recipe: ${error.message}`,
        variant: 'destructive',
      });
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
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};