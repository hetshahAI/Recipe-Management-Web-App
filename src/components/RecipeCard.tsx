import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, Eye } from 'lucide-react';
import { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (id: string) => void;
}

export const RecipeCard = ({ recipe, onView }: RecipeCardProps) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-recipe-accent text-white';
      case 'medium': return 'bg-recipe-secondary text-white';
      case 'hard': return 'bg-recipe-warm text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Card className="group overflow-hidden transition-smooth hover:shadow-elevated hover:-translate-y-1 bg-gradient-card border-0">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={recipe.image_url || '/placeholder.svg'}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
          {recipe.cuisine && (
            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
              {recipe.cuisine}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {recipe.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">{recipe.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
          
          {recipe.difficulty && (
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <Badge className={getDifficultyColor(recipe.difficulty)} variant="secondary">
                {recipe.difficulty}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{recipe.ingredients.length} ingredients</span>
          <span>{recipe.instructions.length} steps</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          variant="recipe" 
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            console.log('Recipe card clicked, navigating to:', recipe.id);
            onView(recipe.id);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
};