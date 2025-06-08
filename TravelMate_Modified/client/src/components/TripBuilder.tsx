import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import InteractiveMap from "./InteractiveMap";

const travelStyles = [
  "Adventure", "Culture", "Relaxation", "Nightlife", "Food", 
  "Photography", "Romance", "Family", "Budget", "Luxury"
];

const countries = [
  { name: "Thailand", regions: ["Bangkok", "Chiang Mai", "Phuket", "Krabi"] },
  { name: "Japan", regions: ["Tokyo", "Kyoto", "Osaka", "Hiroshima"] },
  { name: "Italy", regions: ["Rome", "Florence", "Venice", "Milan"] },
  { name: "Peru", regions: ["Lima", "Cusco", "Arequipa", "Iquitos"] },
  { name: "Norway", regions: ["Oslo", "Bergen", "Tromsø", "Stavanger"] },
  { name: "Morocco", regions: ["Marrakech", "Casablanca", "Fez", "Rabat"] },
];

export default function TripBuilder() {
  const [formData, setFormData] = useState({
    destination: "",
    country: "",
    region: "",
    duration: "",
    budget: "",
    selectedStyles: [] as string[],
    description: "",
  });
  
  const { toast } = useToast();

  const createTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      await apiRequest("POST", "/api/trips", tripData);
    },
    onSuccess: () => {
      toast({
        title: "Trip Created!",
        description: "Your custom trip has been created successfully.",
      });
      // Reset form
      setFormData({
        destination: "",
        country: "",
        region: "",
        duration: "",
        budget: "",
        selectedStyles: [],
        description: "",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStyleToggle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStyles: prev.selectedStyles.includes(style)
        ? prev.selectedStyles.filter(s => s !== style)
        : [...prev.selectedStyles, style]
    }));
  };

  const handleSubmit = () => {
    if (!formData.destination || !formData.duration || !formData.budget) {
      toast({
        title: "Missing Information",
        description: "Please fill in destination, duration, and budget.",
        variant: "destructive",
      });
      return;
    }

    const tripData = {
      title: `${formData.destination} Adventure`,
      description: formData.description || `Explore ${formData.destination} with this custom ${formData.duration}-day trip.`,
      destination: formData.destination,
      country: formData.country || formData.destination,
      region: formData.region,
      city: formData.region,
      duration: parseInt(formData.duration),
      price: formData.budget,
      tags: formData.selectedStyles,
      coordinates: { lat: 0, lng: 0 }, // Would be populated by geocoding in real app
      imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    };

    createTripMutation.mutate(tripData);
  };

  const selectedCountry = countries.find(c => c.name === formData.country);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Trip Preferences */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="destination" className="text-sm font-medium text-slate-700 mb-2 block">
                Where do you want to go?
              </Label>
              <Input
                id="destination"
                placeholder="Enter destination..."
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Country</Label>
                <Select value={formData.country} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, country: value, region: "" }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.name} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Region</Label>
                <Select 
                  value={formData.region} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCountry?.regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Duration (days)</Label>
                <Select value={formData.duration} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, duration: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Weekend (2-3 days)</SelectItem>
                    <SelectItem value="5">Week (4-7 days)</SelectItem>
                    <SelectItem value="10">Extended (8+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Budget</Label>
                <Select value={formData.budget} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, budget: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="750">Budget ($500-1000)</SelectItem>
                    <SelectItem value="1750">Mid-range ($1000-2500)</SelectItem>
                    <SelectItem value="3500">Luxury ($2500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Travel Style</Label>
              <div className="flex flex-wrap gap-2">
                {travelStyles.map((style) => (
                  <Badge
                    key={style}
                    variant={formData.selectedStyles.includes(style) ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors ${
                      formData.selectedStyles.includes(style)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-slate-300"
                    }`}
                    onClick={() => handleStyleToggle(style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
                Additional Details (Optional)
              </Label>
              <Input
                id="description"
                placeholder="Any specific preferences or requirements..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-semibold"
              onClick={handleSubmit}
              disabled={createTripMutation.isPending}
            >
              {createTripMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Trip...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Trip
                </>
              )}
            </Button>
          </div>
          
          {/* Map Preview */}
          <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center">
            <InteractiveMap destination={formData.destination} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
