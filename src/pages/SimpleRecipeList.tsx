import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChefHat } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description?: string;
  cuisine?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
}

export const SimpleRecipeList = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, description, cuisine, prep_time, cook_time, servings, difficulty')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <div className="text-center">Loading recipes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Recipe Management</h1>
          <p className="text-xl mb-8">Discover and organize amazing recipes</p>
          <Button variant="secondary" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add New Recipe
          </Button>
        </div>
      </div>

      {/* Recipes */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            All Recipes ({recipes.length})
          </h2>
        </div>

        {recipes.length === 0 ? (
          <Card className="p-12 text-center">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">No recipes found</h3>
            <p className="text-muted-foreground">Start by creating your first recipe</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {recipe.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {recipe.cuisine && (
                      <span className="bg-muted px-2 py-1 rounded">{recipe.cuisine}</span>
                    )}
                    {recipe.difficulty && (
                      <span className="bg-muted px-2 py-1 rounded">{recipe.difficulty}</span>
                    )}
                    {(recipe.prep_time || recipe.cook_time) && (
                      <span className="bg-muted px-2 py-1 rounded">
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="bg-muted px-2 py-1 rounded">{recipe.servings} servings</span>
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};