import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Recipe, CreateRecipeData, UpdateRecipeData } from '@/types/recipe';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: CreateRecipeData | UpdateRecipeData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RecipeForm = ({ recipe, onSubmit, onCancel, isLoading }: RecipeFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: '',
    cuisine: '',
    image_url: '',
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description || '',
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prep_time?.toString() || '',
        cook_time: recipe.cook_time?.toString() || '',
        servings: recipe.servings?.toString() || '',
        difficulty: recipe.difficulty || '',
        cuisine: recipe.cuisine || '',
        image_url: recipe.image_url || '',
      });
    }
  }, [recipe]);

  const addIngredient = () => {
    setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      ingredients: prev.ingredients.filter((_, i) => i !== index) 
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => i === index ? value : ingredient)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      instructions: prev.instructions.filter((_, i) => i !== index) 
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => i === index ? value : instruction)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredIngredients = formData.ingredients.filter(ing => ing.trim() !== '');
    const filteredInstructions = formData.instructions.filter(inst => inst.trim() !== '');
    
    if (filteredIngredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }
    
    if (filteredInstructions.length === 0) {
      alert('Please add at least one instruction');
      return;
    }

    const submitData: CreateRecipeData = {
      title: formData.title,
      description: formData.description || undefined,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      prep_time: formData.prep_time ? parseInt(formData.prep_time) : undefined,
      cook_time: formData.cook_time ? parseInt(formData.cook_time) : undefined,
      servings: formData.servings ? parseInt(formData.servings) : undefined,
      difficulty: formData.difficulty as 'easy' | 'medium' | 'hard' || undefined,
      cuisine: formData.cuisine || undefined,
      image_url: formData.image_url || undefined,
    };

    onSubmit(submitData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {recipe ? 'Edit Recipe' : 'Create New Recipe'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter recipe title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the recipe..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prep_time">Prep Time (min)</Label>
              <Input
                id="prep_time"
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData(prev => ({ ...prev, prep_time: e.target.value }))}
                placeholder="30"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cook_time">Cook Time (min)</Label>
              <Input
                id="cook_time"
                type="number"
                value={formData.cook_time}
                onChange={(e) => setFormData(prev => ({ ...prev, cook_time: e.target.value }))}
                placeholder="45"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                placeholder="4"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input
                id="cuisine"
                value={formData.cuisine}
                onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                placeholder="e.g., Italian, Mexican..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ingredients *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Ingredient
              </Button>
            </div>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}...`}
                  />
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Instructions *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInstruction}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1} instructions...`}
                    rows={2}
                    className="flex-1"
                  />
                  {formData.instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="mt-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="recipe"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};