import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRecipe, useDeleteRecipe } from '@/hooks/useRecipes';
import { ArrowLeft, Edit, Trash2, Clock, Users, ChefHat, Utensils } from 'lucide-react';

export const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(new Set());
  
  const { data: recipe, isLoading, error } = useRecipe(id!);
  const deleteRecipe = useDeleteRecipe();

  const handleDelete = () => {
    if (id) {
      deleteRecipe.mutate(id, {
        onSuccess: () => {
          navigate('/');
        }
      });
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleInstruction = (index: number) => {
    const newChecked = new Set(checkedInstructions);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedInstructions(newChecked);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-recipe-accent text-white';
      case 'medium': return 'bg-recipe-secondary text-white';
      case 'hard': return 'bg-recipe-warm text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse h-96 bg-muted" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Recipe Not Found</h2>
          <p className="text-muted-foreground mb-6">The recipe you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </Card>
      </div>
    );
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image & Title */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={recipe.image_url || '/placeholder.svg'}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="text-white/90 text-lg max-w-2xl">
                  {recipe.description}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-destructive/80 hover:bg-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleteRecipe.isPending}>
                      {deleteRecipe.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Stats */}
            <Card className="bg-gradient-card shadow-card-custom">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {recipe.prep_time && (
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-recipe-primary" />
                      <div className="text-sm text-muted-foreground">Prep Time</div>
                      <div className="font-semibold">{recipe.prep_time} min</div>
                    </div>
                  )}
                  
                  {recipe.cook_time && (
                    <div className="text-center">
                      <Utensils className="h-8 w-8 mx-auto mb-2 text-recipe-secondary" />
                      <div className="text-sm text-muted-foreground">Cook Time</div>
                      <div className="font-semibold">{recipe.cook_time} min</div>
                    </div>
                  )}
                  
                  {recipe.servings && (
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-recipe-accent" />
                      <div className="text-sm text-muted-foreground">Servings</div>
                      <div className="font-semibold">{recipe.servings}</div>
                    </div>
                  )}
                  
                  {recipe.difficulty && (
                    <div className="text-center">
                      <ChefHat className="h-8 w-8 mx-auto mb-2 text-recipe-warm" />
                      <div className="text-sm text-muted-foreground">Difficulty</div>
                      <Badge className={getDifficultyColor(recipe.difficulty)} variant="secondary">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="shadow-card-custom">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-hero rounded-full" />
                  Ingredients ({recipe.ingredients.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        checkedIngredients.has(index)
                          ? 'bg-recipe-primary/10 text-muted-foreground line-through'
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => toggleIngredient(index)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        checkedIngredients.has(index)
                          ? 'bg-recipe-primary border-recipe-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {checkedIngredients.has(index) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="flex-1">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recipe Meta */}
            <Card className="shadow-card-custom">
              <CardContent className="p-6 space-y-4">
                {recipe.cuisine && (
                  <div>
                    <span className="text-sm text-muted-foreground">Cuisine Type</span>
                    <Badge variant="secondary" className="ml-2">{recipe.cuisine}</Badge>
                  </div>
                )}
                
                {totalTime > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Total Time</span>
                    <div className="font-semibold text-lg">{totalTime} minutes</div>
                  </div>
                )}
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(recipe.created_at).toLocaleDateString()}
                  {recipe.updated_at !== recipe.created_at && (
                    <div>Updated: {new Date(recipe.updated_at).toLocaleDateString()}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8 shadow-card-custom">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-accent rounded-full" />
              Instructions ({recipe.instructions.length} steps)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className={`flex gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                    checkedInstructions.has(index)
                      ? 'bg-recipe-accent/10 opacity-60'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                  onClick={() => toggleInstruction(index)}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    checkedInstructions.has(index)
                      ? 'bg-recipe-accent text-white'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`flex-1 ${checkedInstructions.has(index) ? 'line-through' : ''}`}>
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};