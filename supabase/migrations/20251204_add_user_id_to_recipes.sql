-- Add user_id to recipes and enforce ownership with RLS

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Enable Row Level Security (already enabled in earlier migration, but ensure it's on)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Drop old policies that allow anyone to access recipes
DROP POLICY IF EXISTS "Anyone can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can create recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can delete recipes" ON public.recipes;

-- Create new policies for user-owned recipes
CREATE POLICY "Users can view their own recipes" ON public.recipes
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can create their own recipes" ON public.recipes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own recipes" ON public.recipes
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own recipes" ON public.recipes
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes (user_id);
