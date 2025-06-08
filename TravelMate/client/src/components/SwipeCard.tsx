import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Calendar, DollarSign, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Trip } from "@shared/schema";

interface SwipeCardProps {
  trips: Trip[];
}

export default function SwipeCard({ trips }: SwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, currentX: 0 });
  const [swipeIndicator, setSwipeIndicator] = useState<'like' | 'pass' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const swipeMutation = useMutation({
    mutationFn: async ({ tripId, liked }: { tripId: number; liked: boolean }) => {
      await apiRequest("POST", `/api/trips/${tripId}/swipe`, { liked });
    },
    onSuccess: (_, { liked }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips/swipeable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/trips"] });
      
      if (liked) {
        toast({
          title: "Trip Saved!",
          description: "Added to your saved trips.",
        });
      }
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
        description: "Failed to record swipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || currentIndex >= trips.length) return;
    
    setDragState({
      isDragging: true,
      startX: e.clientX,
      currentX: e.clientX
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || isAnimating) return;
    
    const deltaX = e.clientX - dragState.startX;
    setDragState(prev => ({ ...prev, currentX: e.clientX }));
    
    if (cardRef.current) {
      const rotation = deltaX * 0.1;
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
      cardRef.current.classList.add('dragging');
    }
    
    // Show swipe indicators
    if (Math.abs(deltaX) > 50) {
      setSwipeIndicator(deltaX > 0 ? 'like' : 'pass');
    } else {
      setSwipeIndicator(null);
    }
  };

  const handleMouseUp = () => {
    if (!dragState.isDragging) return;
    
    const deltaX = dragState.currentX - dragState.startX;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
      handleSwipe(deltaX > 0);
    } else {
      // Snap back to center
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.classList.remove('dragging');
      }
      setSwipeIndicator(null);
    }
    
    setDragState({ isDragging: false, startX: 0, currentX: 0 });
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating || currentIndex >= trips.length) return;
    
    const touch = e.touches[0];
    setDragState({
      isDragging: true,
      startX: touch.clientX,
      currentX: touch.clientX
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging || isAnimating) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragState.startX;
    setDragState(prev => ({ ...prev, currentX: touch.clientX }));
    
    if (cardRef.current) {
      const rotation = deltaX * 0.1;
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
      cardRef.current.classList.add('dragging');
    }
    
    if (Math.abs(deltaX) > 50) {
      setSwipeIndicator(deltaX > 0 ? 'like' : 'pass');
    } else {
      setSwipeIndicator(null);
    }
  };

  const handleTouchEnd = () => {
    if (!dragState.isDragging) return;
    
    const deltaX = dragState.currentX - dragState.startX;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
      handleSwipe(deltaX > 0);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.classList.remove('dragging');
      }
      setSwipeIndicator(null);
    }
    
    setDragState({ isDragging: false, startX: 0, currentX: 0 });
  };

  const handleSwipe = (liked: boolean) => {
    if (isAnimating || currentIndex >= trips.length) return;

    setIsAnimating(true);
    setSwipeIndicator(null);
    const currentTrip = trips[currentIndex];
    
    // Add swipe animation class
    if (cardRef.current) {
      cardRef.current.classList.add(liked ? 'swiping-right' : 'swiping-left');
      cardRef.current.classList.remove('dragging');
    }

    // Record the swipe
    swipeMutation.mutate({ tripId: currentTrip.id, liked });

    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
      
      // Reset card transform
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.classList.remove('swiping-right', 'swiping-left');
      }
    }, 300);
  };

  if (currentIndex >= trips.length) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No more trips!</h3>
            <p className="text-slate-600">You've seen all available trips. Check back later for new adventures.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTrip = trips[currentIndex];
  const nextTrip = trips[currentIndex + 1];

  return (
    <div className="relative">
      {/* Next card (behind) */}
      {nextTrip && (
        <Card className="absolute top-2 left-2 right-2 transform scale-95 opacity-75 z-0">
          <div 
            className="h-80 bg-cover bg-center rounded-t-2xl"
            style={{ 
              backgroundImage: `url(${nextTrip.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'})` 
            }}
          >
            <div className="h-full bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{nextTrip.title}</h3>
              <div className="flex items-center space-x-4 text-white/90 text-sm">
                <span><Calendar className="w-4 h-4 mr-1 inline" />{nextTrip.duration} days</span>
                <span><DollarSign className="w-4 h-4 mr-1 inline" />${nextTrip.price}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Current card (front) */}
      <Card 
        ref={cardRef}
        className="swipe-card swipe-card-active relative z-10 transform transition-transform hover:scale-105"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Indicators */}
        {swipeIndicator && (
          <div className={`swipe-indicator ${swipeIndicator}`} style={{ opacity: 1 }}>
            {swipeIndicator === 'like' ? '❤️' : '✕'}
          </div>
        )}
        
        <div 
          className="h-80 bg-cover bg-center rounded-t-2xl"
          style={{ 
            backgroundImage: `url(${currentTrip.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'})` 
          }}
        >
          <div className="h-full bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl flex flex-col justify-end p-6">
            <h3 className="text-2xl font-bold text-white mb-2">{currentTrip.title}</h3>
            <div className="flex items-center space-x-4 text-white/90 text-sm">
              <span><Calendar className="w-4 h-4 mr-1 inline" />{currentTrip.duration} days</span>
              <span><DollarSign className="w-4 h-4 mr-1 inline" />${currentTrip.price}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {currentTrip.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <p className="text-slate-600 mb-4 line-clamp-2">
            {currentTrip.description || `Explore ${currentTrip.destination} with this amazing ${currentTrip.duration}-day adventure.`}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Users className="w-4 h-4" />
              <span>124 travelers</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              ${currentTrip.price}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swipe Actions */}
      <div className="flex justify-center space-x-6 mt-8">
        <Button
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={() => handleSwipe(false)}
          disabled={isAnimating || swipeMutation.isPending}
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 border-0"
          onClick={() => handleSwipe(true)}
          disabled={isAnimating || swipeMutation.isPending}
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
