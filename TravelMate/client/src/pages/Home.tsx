import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SwipeCard from "@/components/SwipeCard";
import TripBuilder from "@/components/TripBuilder";
import CommunityFeed from "@/components/CommunityFeed";
import TripCard from "@/components/TripCard";
import TripFilters, { type FilterState } from "@/components/TripFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Filter, SortAsc } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import type { Trip } from "@shared/schema";

export default function Home() {
  const [activeSection, setActiveSection] = useState("explore");
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [500, 4000],
    duration: "",
    tags: [],
    destination: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch swipeable trips
  const { 
    data: swipeableTrips = [] as Trip[], 
    isLoading: tripsLoading,
    error: tripsError 
  } = useQuery({
    queryKey: ["/api/trips/swipeable"],
    retry: false,
  });

  // Fetch user's saved trips
  const { 
    data: userTrips = [] as any[], 
    isLoading: userTripsLoading,
    error: userTripsError 
  } = useQuery({
    queryKey: ["/api/user/trips"],
    retry: false,
  });

  // Apply filters to swipeable trips
  const filteredTrips = useMemo(() => {
    return swipeableTrips.filter((trip: Trip) => {
      // Price filter
      const price = parseFloat(trip.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Duration filter
      if (filters.duration) {
        const [min, max] = filters.duration.split('-').map(d => d === '+' ? Infinity : parseInt(d));
        if (trip.duration < min || (max !== Infinity && trip.duration > max)) {
          return false;
        }
      }

      // Destination filter
      if (filters.destination && !trip.country.toLowerCase().includes(filters.destination.toLowerCase())) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const tripTags = trip.tags || [];
        const hasMatchingTag = filters.tags.some(filterTag => 
          tripTags.some(tripTag => tripTag.toLowerCase().includes(filterTag.toLowerCase()))
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }, [swipeableTrips, filters]);

  const clearFilters = () => {
    setFilters({
      priceRange: [500, 4000],
      duration: "",
      tags: [],
      destination: "",
    });
  };

  // Handle unauthorized errors
  useEffect(() => {
    if (tripsError && isUnauthorizedError(tripsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [tripsError, toast]);

  useEffect(() => {
    if (userTripsError && isUnauthorizedError(userTripsError)) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [userTripsError, toast]);

  const renderExploreSection = () => (
    <section id="explore" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Discover Your Next Adventure</h2>
        <div className="flex items-center space-x-3">
          <TripFilters 
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Heart className="text-red-500 w-4 h-4" />
            <span>Swipe to like trips</span>
          </div>
        </div>
      </div>
      
      <div className="relative max-w-md mx-auto">
        {tripsLoading ? (
          <Card className="w-full h-96">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading amazing trips...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredTrips.length === 0 ? (
          <Card className="w-full h-96">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {swipeableTrips.length === 0 ? "No more trips to explore" : "No trips match your filters"}
                </h3>
                <p className="text-slate-600">
                  {swipeableTrips.length === 0 
                    ? "You've seen all available trips! Check back later for new adventures."
                    : "Try adjusting your filters to see more trip options."
                  }
                </p>
                {swipeableTrips.length > 0 && (
                  <Button onClick={clearFilters} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <SwipeCard trips={filteredTrips} />
        )}
      </div>
    </section>
  );

  const renderSearchSection = () => (
    <section id="search" className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Build Your Perfect Trip</h2>
      <TripBuilder />
    </section>
  );

  const renderCommunitySection = () => (
    <section id="community" className="mb-12">
      <CommunityFeed />
    </section>
  );

  const renderTripsSection = () => (
    <section id="trips" className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Trips</h2>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <SortAsc className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {userTripsLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-slate-200 rounded-t-xl"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded mb-4 w-2/3"></div>
                <div className="h-3 bg-slate-200 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                  <div className="h-8 bg-slate-200 rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : userTrips.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved trips yet</h3>
            <p className="text-slate-600 mb-4">
              Start exploring and save trips you love to see them here.
            </p>
            <Button onClick={() => setActiveSection("explore")} className="bg-blue-600 hover:bg-blue-700">
              Discover Trips
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTrips.map((userTrip: any) => (
            <TripCard 
              key={userTrip.id} 
              trip={userTrip.trip} 
              status={userTrip.status}
              savedAt={userTrip.savedAt}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === "explore" && renderExploreSection()}
      {activeSection === "search" && renderSearchSection()}
      {activeSection === "community" && renderCommunitySection()}
      {activeSection === "trips" && renderTripsSection()}
    </Layout>
  );
}
