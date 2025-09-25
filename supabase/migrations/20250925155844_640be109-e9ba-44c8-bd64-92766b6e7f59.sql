-- Create recipes table with comprehensive recipe management features
CREATE TABLE public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) >= 2 AND char_length(title) <= 200),
  description TEXT CHECK (char_length(description) <= 500),
  ingredients TEXT[] NOT NULL CHECK (array_length(ingredients, 1) >= 1),
  instructions TEXT[] NOT NULL CHECK (array_length(instructions, 1) >= 1),
  prep_time INTEGER CHECK (prep_time > 0 AND prep_time <= 1440), -- minutes, max 24 hours
  cook_time INTEGER CHECK (cook_time > 0 AND cook_time <= 1440), -- minutes, max 24 hours
  servings INTEGER CHECK (servings > 0 AND servings <= 100),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine TEXT CHECK (char_length(cuisine) <= 50),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view, create, update, delete recipes)
-- In a real app, you'd want user authentication and ownership-based policies
CREATE POLICY "Anyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Anyone can create recipes" ON public.recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update recipes" ON public.recipes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete recipes" ON public.recipes FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX idx_recipes_title ON public.recipes USING gin(to_tsvector('english', title));
CREATE INDEX idx_recipes_cuisine ON public.recipes (cuisine);
CREATE INDEX idx_recipes_difficulty ON public.recipes (difficulty);
CREATE INDEX idx_recipes_created_at ON public.recipes (created_at DESC);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample recipes
INSERT INTO public.recipes (title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cuisine, image_url) VALUES
('Classic Margherita Pizza', 'A simple and delicious pizza with fresh basil, mozzarella, and tomatoes', 
 ARRAY['Pizza dough', '200ml tomato sauce', '200g fresh mozzarella', 'Fresh basil leaves', '2 tbsp olive oil', 'Salt to taste'], 
 ARRAY['Preheat oven to 220°C (425°F)', 'Roll out pizza dough on floured surface', 'Spread tomato sauce evenly', 'Add torn mozzarella pieces', 'Drizzle with olive oil', 'Bake for 12-15 minutes until crust is golden', 'Add fresh basil leaves and serve'],
 15, 15, 4, 'easy', 'Italian', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'),

('Beef Tacos', 'Authentic Mexican beef tacos with fresh toppings', 
 ARRAY['500g ground beef', '8 corn tortillas', '1 onion, diced', '2 cloves garlic, minced', '1 tbsp cumin', '1 tsp paprika', '200g cheese, shredded', 'Lettuce, tomatoes, salsa'], 
 ARRAY['Heat oil in large pan over medium-high heat', 'Cook ground beef until browned, about 5 minutes', 'Add onion and garlic, cook 3 minutes', 'Season with cumin, paprika, salt and pepper', 'Warm tortillas in dry pan or microwave', 'Fill tortillas with beef mixture', 'Top with cheese, lettuce, tomatoes, and salsa'],
 10, 15, 4, 'easy', 'Mexican', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b'),

('Chocolate Chip Cookies', 'Soft and chewy homemade chocolate chip cookies', 
 ARRAY['225g butter, softened', '100g brown sugar', '50g caster sugar', '1 egg', '1 tsp vanilla extract', '225g plain flour', '1/2 tsp baking soda', '1/2 tsp salt', '200g chocolate chips'], 
 ARRAY['Preheat oven to 180°C (350°F)', 'Cream butter and sugars until light and fluffy', 'Beat in egg and vanilla', 'Mix flour, baking soda and salt in separate bowl', 'Gradually add dry ingredients to wet ingredients', 'Fold in chocolate chips', 'Drop rounded tablespoons onto baking sheet', 'Bake 9-11 minutes until edges are golden', 'Cool on baking sheet for 5 minutes before transferring'],
 15, 10, 24, 'easy', 'American', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e'),

('Thai Green Curry', 'Fragrant and spicy Thai curry with vegetables and coconut milk', 
 ARRAY['2 tbsp green curry paste', '400ml coconut milk', '300g chicken breast, sliced', '1 aubergine, cubed', '100g green beans', '2 tbsp fish sauce', '1 tbsp palm sugar', '4 Thai basil leaves', 'Jasmine rice to serve'], 
 ARRAY['Heat 3 tbsp coconut milk in wok over medium heat', 'Add curry paste and fry for 2 minutes', 'Add chicken and cook until nearly done', 'Pour in remaining coconut milk', 'Add aubergine and green beans', 'Season with fish sauce and palm sugar', 'Simmer 10 minutes until vegetables are tender', 'Garnish with Thai basil and serve with rice'],
 15, 20, 4, 'medium', 'Thai', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd'),

('Caesar Salad', 'Classic Caesar salad with homemade croutons and dressing', 
 ARRAY['2 romaine lettuce heads', '50g parmesan cheese', '2 slices bread for croutons', '2 tbsp olive oil', '2 cloves garlic', '2 anchovy fillets', '1 egg yolk', '1 tsp Dijon mustard', '2 tbsp lemon juice'], 
 ARRAY['Cut bread into cubes, toss with olive oil and bake until golden', 'Wash and chop romaine lettuce', 'Crush garlic and anchovies into paste', 'Whisk egg yolk with mustard and lemon juice', 'Slowly add olive oil while whisking to make dressing', 'Toss lettuce with dressing', 'Top with croutons and grated parmesan'],
 20, 10, 4, 'medium', 'Italian', 'https://images.unsplash.com/photo-1546793665-c74683f339c1');