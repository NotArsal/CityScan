import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface LocationCardProps {
  onLocationChange?: (data: LocationData) => void;
}

const LocationCard = ({ onLocationChange }: LocationCardProps) => {
  const [location, setLocation] = useState("Auto-detecting location...");
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    const now = new Date().toISOString();
    setTimestamp(new Date().toLocaleString());

    if (!navigator.geolocation) {
      setLocation("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

        try {
          // 🔥 CALL YOUR BACKEND INSTEAD OF NOMINATIM
          const response = await fetch(
            `https://public-eye-backend.onrender.com/api/location/reverse?lat=${latitude}&lon=${longitude}`
          );

          if (response.ok) {
            const data = await response.json();
            address = data.address || address;
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
        }

        setLocation(address);

        if (onLocationChange) {
          onLocationChange({
            address,
            latitude,
            longitude,
            timestamp: now,
          });
        }
      },
      () => {
        setLocation("Location permission denied");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-secondary/5">
      <CardContent className="p-4 flex justify-between">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-accent-foreground mt-1" />
          <div>
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-sm text-muted-foreground">{location}</p>
            {timestamp && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{timestamp}</span>
              </div>
            )}
          </div>
        </div>
        <Badge className="bg-success/10 text-success">GPS Active</Badge>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
