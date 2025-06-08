import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Plane, Camera } from "lucide-react";

interface InteractiveMapProps {
  destination?: string;
}

// Mock visited countries data - in real app, this would come from user profile
const visitedCountries = [
  { name: "Thailand", code: "TH", coordinates: { lat: 15.87, lng: 100.99 } },
  { name: "Indonesia", code: "ID", coordinates: { lat: -0.79, lng: 113.92 } },
  { name: "Australia", code: "AU", coordinates: { lat: -25.27, lng: 133.77 } },
  { name: "Germany", code: "DE", coordinates: { lat: 51.17, lng: 10.45 } },
];

const popularDestinations = [
  { name: "Tokyo", country: "Japan", coordinates: { lat: 35.68, lng: 139.69 } },
  { name: "Bali", country: "Indonesia", coordinates: { lat: -8.34, lng: 115.09 } },
  { name: "Bangkok", country: "Thailand", coordinates: { lat: 13.76, lng: 100.50 } },
  { name: "Sydney", country: "Australia", coordinates: { lat: -33.87, lng: 151.21 } },
  { name: "Paris", country: "France", coordinates: { lat: 48.86, lng: 2.35 } },
  { name: "New York", country: "USA", coordinates: { lat: 40.71, lng: -74.01 } },
];

export default function InteractiveMap({ destination }: InteractiveMapProps) {
  const [selectedView, setSelectedView] = useState<"world" | "destination">("world");
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Simple SVG world map representation
  const renderWorldMap = () => (
    <div className="relative bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg p-8 min-h-[400px] overflow-hidden">
      {/* Background grid for map feel */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-slate-300" />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Your Travel Map</h3>
        <p className="text-slate-600">Countries you've visited and dream destinations</p>
      </div>

      {/* Visited Countries */}
      <div className="relative z-10">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Visited Countries ({visitedCountries.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visitedCountries.map((country) => (
              <div
                key={country.code}
                className="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center hover:bg-green-200 transition-colors cursor-pointer"
                onMouseEnter={() => setHoveredLocation(country.name)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                <div className="text-2xl mb-1">🏳️</div>
                <p className="font-medium text-green-800">{country.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div>
          <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
            <Plane className="w-5 h-5 mr-2" />
            Popular Destinations
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularDestinations.map((dest) => (
              <div
                key={dest.name}
                className={`bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors cursor-pointer ${
                  destination?.toLowerCase().includes(dest.name.toLowerCase()) || 
                  destination?.toLowerCase().includes(dest.country.toLowerCase())
                    ? "ring-2 ring-blue-500 bg-blue-100"
                    : ""
                }`}
                onMouseEnter={() => setHoveredLocation(dest.name)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                <MapPin className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="font-medium text-blue-800">{dest.name}</p>
                <p className="text-sm text-blue-600">{dest.country}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Info */}
        {hoveredLocation && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
            <p className="font-medium text-slate-800">{hoveredLocation}</p>
            <p className="text-sm text-slate-600">Click to explore</p>
          </div>
        )}
      </div>

      {/* Travel Stats */}
      <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/80 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{visitedCountries.length}</div>
          <div className="text-sm text-slate-600">Countries Visited</div>
        </div>
        <div className="bg-white/80 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{popularDestinations.length}</div>
          <div className="text-sm text-slate-600">Dream Destinations</div>
        </div>
        <div className="bg-white/80 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">247</div>
          <div className="text-sm text-slate-600">Travel Points</div>
        </div>
      </div>
    </div>
  );

  const renderDestinationMap = () => (
    <div className="relative bg-gradient-to-b from-slate-100 to-slate-50 rounded-lg p-6 min-h-[300px]">
      <div className="text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {destination || "Select a Destination"}
        </h3>
        <p className="text-slate-600 mb-6">
          Interactive map view would appear here with detailed location information
        </p>
        
        {destination && (
          <div className="bg-white rounded-lg p-4 max-w-sm mx-auto">
            <h4 className="font-semibold mb-2">Quick Facts</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>🌡️ Climate: Tropical/Temperate</p>
              <p>💰 Currency: Local Currency</p>
              <p>🗣️ Languages: English + Local</p>
              <p>✈️ Flight Time: 8-12 hours</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Travel Map</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={selectedView === "world" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedView("world")}
            >
              World View
            </Button>
            <Button
              variant={selectedView === "destination" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedView("destination")}
            >
              Destination
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedView === "world" ? renderWorldMap() : renderDestinationMap()}
      </CardContent>
    </Card>
  );
}