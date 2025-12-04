import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecipeCard } from '@/components/RecipeCard';
import { AIRecipeGenerator } from '@/components/AIRecipeGenerator';
import { RecipeFilter } from '@/components/RecipeFilter';
import { useRecipes } from '@/hooks/useRecipes';
import { Search, Plus, ChefHat, Filter } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

interface FilterState {
  cuisine: string;
  difficulty: string;
  prepTime: string;
  servings: string;
}

export const RecipeList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    cuisine: '',
    difficulty: '',
    prepTime: '',
    servings: ''
  });
  
  const { data, isLoading, error } = useRecipes(searchQuery, page, 12, filters);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filtering
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', searchQuery);
    setPage(1); // Reset to first page when searching
  };

  const handleViewRecipe = (id: string) => {
    console.log('Viewing recipe:', id);
    navigate(`/recipe/${id}`);
  };

  const handleCreateRecipe = () => {
    console.log('Creating new recipe');
    navigate('/create');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Recipes</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={heroImage}
          alt="Recipe Management Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-6 max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Recipe Management
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Organize, discover, and create amazing recipes with ease
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={handleCreateRecipe}
                className="text-lg px-8 py-4 h-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Recipe
              </Button>
              <AIRecipeGenerator />
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Search & Actions Bar */}
        <Card className="p-6 bg-gradient-card shadow-card-custom">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search recipes, ingredients, or cuisine..."
                  value={searchQuery}
                  onChange={(e) => {
                    console.log('Search query changed:', e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </form>
            
            <div className="flex flex-wrap gap-3">
              <RecipeFilter 
                onFilterChange={handleFilterChange}
                activeFilters={filters}
              />
              <Button variant="recipe" onClick={handleCreateRecipe}>
                <Plus className="mr-2 h-4 w-4" />
                Add Recipe
              </Button>
              <AIRecipeGenerator />
            </div>
          </div>
        </Card>

        {/* Stats & Results */}
        {data && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <ChefHat className="mr-1 h-3 w-3" />
                {data.recipes.length} recipes
              </Badge>
              {searchQuery && (
                <span className="text-muted-foreground text-sm">
                  Results for "{searchQuery}"
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {userEmail ? (
                <div className="text-sm text-muted-foreground">Signed in as <strong>{userEmail}</strong></div>
              ) : (
                <div className="text-sm text-muted-foreground">Viewing public recipes</div>
              )}
              {userEmail ? (
                <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate('/', { replace: true }); }}>
                  Logout
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-muted" />
            ))}
          </div>
        )}

        {/* Recipe Grid */}
        {data && !isLoading && (
          <>
            {data.recipes.length === 0 ? (
              <Card className="p-12 text-center">
                <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-bold mb-2">No recipes found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? `No recipes match your search for "${searchQuery}"`
                    : "Start by creating your first recipe"
                  }
                </p>
                <Button variant="recipe" onClick={handleCreateRecipe}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Recipe
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onView={handleViewRecipe}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {data.hasMore && (
              <div className="text-center pt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    console.log('Loading more recipes, current page:', page);
                    setPage(prev => prev + 1);
                  }}
                >
                  Load More Recipes
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};