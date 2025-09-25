import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface FilterState {
  cuisine: string;
  difficulty: string;
  prepTime: string;
  servings: string;
}

interface RecipeFilterProps {
  onFilterChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

export const RecipeFilter = ({ onFilterChange, activeFilters }: RecipeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(activeFilters);

  const cuisineOptions = [
    'All Cuisines',
    'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 'Japanese', 
    'Thai', 'Mediterranean', 'American', 'Korean', 'Greek', 'Spanish'
  ];

  const difficultyOptions = [
    'All Difficulties',
    'Easy', 'Medium', 'Hard'
  ];

  const prepTimeOptions = [
    'All Times',
    'Under 15 min',
    '15-30 min',
    '30-60 min',
    'Over 1 hour'
  ];

  const servingsOptions = [
    'All Servings',
    '1-2 people',
    '3-4 people',
    '5-6 people',
    '7+ people'
  ];

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearFilters = {
      cuisine: '',
      difficulty: '',
      prepTime: '',
      servings: ''
    };
    setTempFilters(clearFilters);
    onFilterChange(clearFilters);
    setIsOpen(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value && value !== '').length;
  };

  const filterCount = getActiveFilterCount();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-2 py-1 text-xs">
              {filterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filter Recipes
          </DialogTitle>
          <DialogDescription>
            Filter recipes by cuisine, difficulty, prep time, and servings
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Filter Options</CardTitle>
            <CardDescription>
              Choose your preferences to find the perfect recipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Cuisine Type
              </label>
              <Select 
                value={tempFilters.cuisine || ''} 
                onValueChange={(value) => setTempFilters(prev => ({
                  ...prev, 
                  cuisine: value === 'All Cuisines' ? '' : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineOptions.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Difficulty Level
              </label>
              <Select 
                value={tempFilters.difficulty || ''} 
                onValueChange={(value) => setTempFilters(prev => ({
                  ...prev, 
                  difficulty: value === 'All Difficulties' ? '' : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Prep Time
              </label>
              <Select 
                value={tempFilters.prepTime || ''} 
                onValueChange={(value) => setTempFilters(prev => ({
                  ...prev, 
                  prepTime: value === 'All Times' ? '' : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select prep time" />
                </SelectTrigger>
                <SelectContent>
                  {prepTimeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Servings
              </label>
              <Select 
                value={tempFilters.servings || ''} 
                onValueChange={(value) => setTempFilters(prev => ({
                  ...prev, 
                  servings: value === 'All Servings' ? '' : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select servings" />
                </SelectTrigger>
                <SelectContent>
                  {servingsOptions.map((serving) => (
                    <SelectItem key={serving} value={serving}>
                      {serving}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleApplyFilters}
                className="flex-1"
                variant="recipe"
              >
                Apply Filters
              </Button>
              <Button 
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};