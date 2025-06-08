import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Share2, 
  Download, 
  Edit,
  Trash2,
  Clock,
  Users,
  Camera,
  Plane
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";
import type { Trip } from "@shared/schema";

interface TripCardProps {
  trip: Trip;
  status: string;
  savedAt: string;
}

export default function TripCard({ trip, status, savedAt }: TripCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserTripMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/user/trips/${trip.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/trips"] });
      toast({
        title: "Trip Removed",
        description: "Trip has been removed from your collection.",
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
        description: "Failed to remove trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generatePDF = async () => {
    try {
      // Mock PDF generation - in real app would use jsPDF or similar
      toast({
        title: "PDF Generated",
        description: "Your trip itinerary has been downloaded.",
      });
      
      // Create a simple text-based itinerary for download
      const itinerary = `
TRAVEL ITINERARY
================

Trip: ${trip.title}
Destination: ${trip.city}, ${trip.country}
Duration: ${trip.duration} days
Budget: $${trip.price}

Description:
${trip.description || 'No description available'}

Tags: ${trip.tags?.join(', ') || 'None'}

Generated on: ${new Date().toLocaleDateString()}
      `.trim();
      
      const blob = new Blob([itinerary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareTrip = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.title,
          text: `Check out this amazing trip to ${trip.city}, ${trip.country}!`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      const shareText = `Check out this amazing trip: ${trip.title} - ${trip.city}, ${trip.country}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Link Copied",
        description: "Trip details copied to clipboard.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'liked': return 'bg-green-100 text-green-800';
      case 'saved': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCountdownInfo = () => {
    // Mock countdown logic - in real app would be based on actual trip dates
    const daysUntil = Math.floor(Math.random() * 30) + 1;
    return {
      daysUntil,
      message: daysUntil <= 7 ? "Trip starting soon!" : "Upcoming adventure",
      urgency: daysUntil <= 7 ? "text-orange-600" : "text-blue-600"
    };
  };

  const countdown = getCountdownInfo();

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {trip.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.city}, {trip.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.duration} days</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${trip.price}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(status)}>
                  {status}
                </Badge>
                <Badge variant="outline" className={countdown.urgency}>
                  <Clock className="w-3 h-3 mr-1" />
                  {countdown.daysUntil} days until trip
                </Badge>
              </div>
            </div>
            
            {trip.imageUrl && (
              <div className="ml-4">
                <img 
                  src={trip.imageUrl} 
                  alt={trip.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Saved {formatDistanceToNow(new Date(savedAt))} ago
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={shareTrip}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={generatePDF}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Trip Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      {trip.imageUrl && (
                        <img 
                          src={trip.imageUrl} 
                          alt={trip.title}
                          className="w-full h-48 rounded-lg object-cover mb-4"
                        />
                      )}
                      <h3 className="text-xl font-bold mb-2">{trip.title}</h3>
                      <p className="text-slate-600 mb-4">{trip.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <MapPin className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                        <div className="font-medium">{trip.city}</div>
                        <div className="text-sm text-slate-600">{trip.country}</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <Calendar className="w-5 h-5 mx-auto mb-1 text-green-600" />
                        <div className="font-medium">{trip.duration} days</div>
                        <div className="text-sm text-slate-600">Duration</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <DollarSign className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                        <div className="font-medium">${trip.price}</div>
                        <div className="text-sm text-slate-600">Total Cost</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <Users className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                        <div className="font-medium">1-4</div>
                        <div className="text-sm text-slate-600">Travelers</div>
                      </div>
                    </div>
                    
                    {trip.tags && trip.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Trip Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {trip.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <Plane className="w-4 h-4 mr-2" />
                        {countdown.message}
                      </h4>
                      <p className="text-blue-700 text-sm">
                        Your adventure begins in {countdown.daysUntil} days. Get ready for an amazing experience!
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteUserTripMutation.mutate()}
                disabled={deleteUserTripMutation.isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}