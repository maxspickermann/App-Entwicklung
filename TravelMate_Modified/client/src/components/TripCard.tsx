import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Share2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Trip } from "@shared/schema";

interface TripCardProps {
  trip: Trip;
  status: string;
  savedAt: string;
}

const statusColors = {
  saved: "bg-green-100 text-green-800",
  planned: "bg-blue-100 text-blue-800", 
  completed: "bg-purple-100 text-purple-800",
};

export default function TripCard({ trip, status, savedAt }: TripCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={trip.imageUrl || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"} 
        alt={trip.title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-900">{trip.title}</h3>
          <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-slate-600 text-sm mb-3">
          {trip.destination} • {trip.duration} days
        </p>
        
        <p className="text-slate-700 mb-4 line-clamp-2">
          {trip.description || `Explore ${trip.destination} with this amazing ${trip.duration}-day adventure.`}
        </p>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-slate-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{trip.duration} days</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>${trip.price}</span>
          </div>
        </div>

        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {trip.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">${trip.price}</span>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <ExternalLink className="w-3 h-3 mr-1" />
              View Details
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mt-2">
          Saved {formatDistanceToNow(new Date(savedAt), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  );
}
