import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RecipeForm } from '@/components/RecipeForm';
import { useRecipe, useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { ArrowLeft } from 'lucide-react';
import { CreateRecipeData, UpdateRecipeData } from '@/types/recipe';

export const RecipeFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { data: recipe, isLoading: recipeLoading } = useRecipe(id!);
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  const handleSubmit = (data: CreateRecipeData | UpdateRecipeData) => {
    if (isEdit && id) {
      updateRecipe.mutate(
        { id, updates: data },
        {
          onSuccess: (updatedRecipe) => {
            navigate(`/recipe/${updatedRecipe.id}`);
          }
        }
      );
    } else {
      createRecipe.mutate(
        data as CreateRecipeData,
        {
          onSuccess: (newRecipe) => {
            navigate(`/recipe/${newRecipe.id}`);
          }
        }
      );
    }
  };

  const handleCancel = () => {
    if (isEdit && id) {
      navigate(`/recipe/${id}`);
    } else {
      navigate('/');
    }
  };

  if (isEdit && recipeLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </div>

        {/* Form */}
        <RecipeForm
          recipe={recipe}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createRecipe.isPending || updateRecipe.isPending}
        />
      </div>
    </div>
  );
};