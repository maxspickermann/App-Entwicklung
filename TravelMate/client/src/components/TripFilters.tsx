import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, X, SlidersHorizontal } from "lucide-react";

const travelStyles = [
  "Adventure", "Culture", "Relaxation", "Nightlife", "Food", 
  "Photography", "Romance", "Family", "Budget", "Luxury"
];

const durations = [
  { label: "Weekend (2-3 days)", value: "2-3" },
  { label: "Week (4-7 days)", value: "4-7" },
  { label: "Extended (8+ days)", value: "8+" },
];

interface FilterState {
  priceRange: [number, number];
  duration: string;
  tags: string[];
  destination: string;
}

interface TripFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export default function TripFilters({ filters, onFiltersChange, onClearFilters }: TripFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const hasActiveFilters = filters.tags.length > 0 || 
                          filters.duration !== "" || 
                          filters.destination !== "" ||
                          filters.priceRange[0] > 500 || 
                          filters.priceRange[1] < 4000;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Trips</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-3 block">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              max={4000}
              min={500}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$500</span>
              <span>$4000+</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Duration</label>
            <Select value={filters.duration} onValueChange={(value) => 
              onFiltersChange({ ...filters, duration: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Any duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any duration</SelectItem>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destination */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Destination</label>
            <Select value={filters.destination} onValueChange={(value) => 
              onFiltersChange({ ...filters, destination: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Any destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any destination</SelectItem>
                <SelectItem value="Thailand">Thailand</SelectItem>
                <SelectItem value="Indonesia">Indonesia</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Italy">Italy</SelectItem>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Morocco">Morocco</SelectItem>
                <SelectItem value="Norway">Norway</SelectItem>
                <SelectItem value="Peru">Peru</SelectItem>
                <SelectItem value="Greece">Greece</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Travel Style */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-3 block">Travel Style</label>
            <div className="flex flex-wrap gap-2">
              {travelStyles.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "secondary"}
                  className={`cursor-pointer transition-colors ${
                    filters.tags.includes(tag)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:bg-slate-300"
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <Button 
            onClick={() => setIsOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { FilterState };