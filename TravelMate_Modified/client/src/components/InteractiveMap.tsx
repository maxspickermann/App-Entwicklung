import { MapPin } from "lucide-react";

interface InteractiveMapProps {
  destination?: string;
}

export default function InteractiveMap({ destination }: InteractiveMapProps) {
  return (
    <div className="w-full h-full flex items-center justify-center text-slate-500">
      <div className="text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <p className="font-semibold mb-2">Interactive Map</p>
        {destination ? (
          <p className="text-sm">Showing route for {destination}</p>
        ) : (
          <p className="text-sm">Select a destination to view map</p>
        )}
        <p className="text-xs mt-2 text-slate-400">
          Map integration coming soon
        </p>
      </div>
    </div>
  );
}
