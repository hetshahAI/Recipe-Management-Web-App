import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, CreateRecipeData, UpdateRecipeData } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

interface FilterState {
  cuisine: string;
  difficulty: string;
  prepTime: string;
  servings: string;
}

export const useRecipes = (searchQuery?: string, page = 1, limit = 12, filters?: FilterState) => {
  return useQuery({
    queryKey: ['recipes', searchQuery, page, limit, filters],
    queryFn: async () => {
      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,cuisine.ilike.%${searchQuery}%`);
      }

      // Apply filters
      if (filters) {
        if (filters.cuisine) {
          query = query.eq('cuisine', filters.cuisine);
        }
        if (filters.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }
        if (filters.prepTime) {
          // Convert time filter to numeric range
          switch (filters.prepTime) {
            case 'Under 15 min':
              query = query.lt('prep_time', 15);
              break;
            case '15-30 min':
              query = query.gte('prep_time', 15).lte('prep_time', 30);
              break;
            case '30-60 min':
              query = query.gte('prep_time', 30).lte('prep_time', 60);
              break;
            case 'Over 1 hour':
              query = query.gt('prep_time', 60);
              break;
          }
        }
        if (filters.servings) {
          // Convert servings filter to numeric range
          switch (filters.servings) {
            case '1-2 people':
              query = query.gte('servings', 1).lte('servings', 2);
              break;
            case '3-4 people':
              query = query.gte('servings', 3).lte('servings', 4);
              break;
            case '5-6 people':
              query = query.gte('servings', 5).lte('servings', 6);
              break;
            case '7+ people':
              query = query.gte('servings', 7);
              break;
          }
        }
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error } = await query.range(from, to);

      if (error) throw error;

      // Get total count for pagination
      const { count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

      return {
        recipes: data as Recipe[],
        totalCount: count || 0,
        hasMore: (count || 0) > page * limit
      };
    },
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    enabled: !!id,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (recipeData: CreateRecipeData) => {
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Success!',
        description: 'Recipe created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create recipe: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRecipeData }) => {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', data.id] });
      toast({
        title: 'Success!',
        description: 'Recipe updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update recipe: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Success!',
        description: 'Recipe deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete recipe: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};