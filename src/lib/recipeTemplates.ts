import { Recipe } from '@/types/recipe';

type TemplateMap = {
  [key: string]: Partial<Recipe>;
};

const templates: TemplateMap = {
  dosa: {
    title: 'Masala Dosa',
    description: 'Crispy fermented rice and lentil crepe filled with spiced potato masala.',
    cuisine: 'Indian',
    prep_time: 20,
    cook_time: 30,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      '2 cups idli/dosa batter',
      '4 potatoes, boiled and mashed',
      '1 onion, sliced',
      '1 tsp mustard seeds',
      '1 tsp turmeric',
      'Salt to taste',
      'Oil for cooking'
    ],
    instructions: [
      'Prepare potato masala by sautéing onions and spices, then mix with boiled potatoes.',
      'Heat a griddle and pour batter to form a thin crepe.',
      'Cook until crisp, add potato masala, fold and serve with chutney.'
    ]
  },
  omelette: {
    title: 'Classic Omelette',
    description: 'Quick and fluffy omelette with herbs.',
    cuisine: 'American',
    prep_time: 5,
    cook_time: 5,
    servings: 1,
    difficulty: 'Easy',
    ingredients: ['2 eggs', 'Salt', 'Pepper', '1 tbsp butter', 'Chopped herbs (optional)'],
    instructions: ['Beat eggs with salt and pepper.', 'Melt butter in pan, pour eggs, cook until set and fold.']
  },
  pancake: {
    title: 'Fluffy Pancakes',
    description: 'Simple breakfast pancakes.',
    cuisine: 'American',
    prep_time: 10,
    cook_time: 15,
    servings: 4,
    difficulty: 'Easy',
    ingredients: ['1.5 cups flour', '1 tbsp sugar', '1 tbsp baking powder', '1 egg', '1.25 cups milk', '2 tbsp butter'],
    instructions: ['Mix dry and wet ingredients separately then combine.', 'Cook on griddle until golden brown.']
  },
  pizza: {
    title: 'Simple Margherita Pizza',
    description: 'Homemade pizza with tomato sauce and cheese.',
    cuisine: 'Italian',
    prep_time: 20,
    cook_time: 15,
    servings: 4,
    difficulty: 'Medium',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese', 'Basil leaves', 'Olive oil'],
    instructions: ['Preheat oven to high temp.', 'Roll dough, add sauce and cheese.', 'Bake until crust is golden and cheese melted.']
  },
  pasta: {
    title: 'Garlic & Herb Pasta',
    description: 'Quick pasta tossed with garlic, herbs and olive oil.',
    cuisine: 'Italian',
    prep_time: 10,
    cook_time: 15,
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['200g pasta', '2 cloves garlic', 'Olive oil', 'Chopped parsley', 'Salt', 'Pepper'],
    instructions: ['Cook pasta until al dente.', 'Sauté garlic in olive oil, toss pasta with garlic and herbs.']
  },
  salad: {
    title: 'Fresh Garden Salad',
    description: 'Crisp mixed greens with a light vinaigrette.',
    cuisine: 'International',
    prep_time: 10,
    cook_time: 0,
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil', 'Vinegar', 'Salt'],
    instructions: ['Combine vegetables, whisk dressing and toss to combine.']
  }
  ,
  hotdog: {
    title: 'Classic Grilled Hot Dog',
    description: 'Simple grilled hot dog with optional toppings.',
    cuisine: 'American',
    prep_time: 5,
    cook_time: 8,
    servings: 1,
    difficulty: 'Easy',
    ingredients: ['1 hot dog sausage', '1 bun', 'Ketchup', 'Mustard', 'Onions (optional)'],
    instructions: ['Preheat grill or pan.', 'Grill the sausage until cooked through and slightly charred.', 'Place in bun and add desired toppings.']
  },
  taco: {
    title: 'Quick Beef Tacos',
    description: 'Seasoned beef in soft or hard taco shells with crunchy toppings.',
    cuisine: 'Mexican',
    prep_time: 10,
    cook_time: 10,
    servings: 4,
    difficulty: 'Easy',
    ingredients: ['500g ground beef', 'Taco seasoning', 'Taco shells', 'Lettuce', 'Cheese', 'Salsa'],
    instructions: ['Cook and brown the ground beef, add taco seasoning and a splash of water.', 'Warm shells and assemble tacos with toppings.']
  },
  burrito: {
    title: 'Simple Chicken Burrito',
    description: 'Flour tortilla filled with seasoned chicken, rice and beans.',
    cuisine: 'Mexican',
    prep_time: 15,
    cook_time: 20,
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['2 flour tortillas', '200g cooked chicken', 'Cooked rice', 'Black beans', 'Salsa', 'Cheese'],
    instructions: ['Warm tortilla, layer rice, beans, chicken and salsa, fold and serve.']
  },
  burger: {
    title: 'Easy Cheeseburger',
    description: 'Juicy burger with cheese and classic toppings.',
    cuisine: 'American',
    prep_time: 10,
    cook_time: 12,
    servings: 1,
    difficulty: 'Easy',
    ingredients: ['150g ground beef', 'Salt & pepper', '1 slice cheese', 'Burger bun', 'Lettuce', 'Tomato'],
    instructions: ['Form patty and season, cook to desired doneness.', 'Assemble on bun with cheese and toppings.']
  },
  sandwich: {
    title: 'Toasted Sandwich',
    description: 'Quick toasted sandwich with cheese and fillings.',
    cuisine: 'International',
    prep_time: 5,
    cook_time: 6,
    servings: 1,
    difficulty: 'Easy',
    ingredients: ['2 slices bread', 'Cheese', 'Butter', 'Fillings of choice (ham, tomato, etc.)'],
    instructions: ['Butter bread, add fillings and toast in a pan or sandwich press until golden.']
  }
};

export function getTemplateForLabel(label: string): Partial<Recipe> | null {
  if (!label) return null;
  const key = label.toLowerCase();
  // check for known keywords
  for (const k of Object.keys(templates)) {
    if (key.includes(k)) return templates[k];
  }
  return null;
}

export default getTemplateForLabel;
