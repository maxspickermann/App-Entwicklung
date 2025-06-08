import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ImageUpload";
import InteractiveMap from "@/components/InteractiveMap";
import { 
  User, 
  Settings, 
  MapPin, 
  Languages, 
  Heart,
  Camera,
  Save,
  Award,
  Globe
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

const travelStyles = [
  "Adventure", "Culture", "Relaxation", "Nightlife", "Food", 
  "Photography", "Romance", "Family", "Budget", "Luxury"
];

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Spain", "Italy",
  "Australia", "Japan", "South Korea", "Thailand", "Indonesia", "Singapore",
  "Brazil", "Argentina", "Mexico", "India", "China", "Other"
];

const languages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch",
  "Japanese", "Korean", "Mandarin", "Thai", "Indonesian", "Arabic", "Other"
];

const dietaryPreferences = [
  "No restrictions", "Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Other"
];

export default function UserProfile() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: "",
    homeCountry: "",
    languages: [] as string[],
    travelStyle: [] as string[],
    dietaryPreference: "",
    bio: "",
    profileImageUrl: user?.profileImageUrl || "",
    isPublic: true,
    showAge: true,
    showCountry: true,
    showLanguages: true,
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsOpen(false);
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLanguageToggle = (language: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleStyleToggle = (style: string) => {
    setProfileData(prev => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(style)
        ? prev.travelStyle.filter(s => s !== style)
        : [...prev.travelStyle, style]
    }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  // Mock badges based on user activity
  const userBadges = [
    { name: "Food Expert", icon: "🍽️", description: "5+ food-related posts" },
    { name: "Adventurer", icon: "🏔️", description: "Completed adventure trips" },
    { name: "Community Helper", icon: "🤝", description: "10+ helpful comments" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block">Profile</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Edit Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={profileData.profileImageUrl} alt="Profile" />
                <AvatarFallback className="text-2xl">
                  {profileData.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <ImageUpload
              onImageSelect={(imageUrl) => setProfileData(prev => ({ ...prev, profileImageUrl: imageUrl }))}
              currentImage={profileData.profileImageUrl}
              className="max-w-xs mx-auto"
            />
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={profileData.age}
                    onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="homeCountry">Home Country</Label>
                  <Select value={profileData.homeCountry} onValueChange={(value) => 
                    setProfileData(prev => ({ ...prev, homeCountry: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Travel Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Travel Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Languages Spoken</Label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <Badge
                      key={language}
                      variant={profileData.languages.includes(language) ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors ${
                        profileData.languages.includes(language)
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-slate-300"
                      }`}
                      onClick={() => handleLanguageToggle(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Travel Style</Label>
                <div className="flex flex-wrap gap-2">
                  {travelStyles.map((style) => (
                    <Badge
                      key={style}
                      variant={profileData.travelStyle.includes(style) ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors ${
                        profileData.travelStyle.includes(style)
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
                <Label htmlFor="dietaryPreference">Dietary Preference</Label>
                <Select value={profileData.dietaryPreference} onValueChange={(value) => 
                  setProfileData(prev => ({ ...prev, dietaryPreference: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {dietaryPreferences.map((pref) => (
                      <SelectItem key={pref} value={pref}>
                        {pref}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-slate-600">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={profileData.isPublic}
                  onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Age</Label>
                  <p className="text-sm text-slate-600">Display your age on your profile</p>
                </div>
                <Switch
                  checked={profileData.showAge}
                  onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, showAge: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Home Country</Label>
                  <p className="text-sm text-slate-600">Display your home country</p>
                </div>
                <Switch
                  checked={profileData.showCountry}
                  onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, showCountry: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Travel Map */}
          <InteractiveMap />

          {/* Badges & Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Badges & Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userBadges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <p className="font-medium text-slate-900">{badge.name}</p>
                      <p className="text-sm text-slate-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}