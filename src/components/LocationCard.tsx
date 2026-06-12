import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config";

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface LocationCardProps {
  location?: string;
  timestamp?: string;
  className?: string;
  onLocationChange?: (data: LocationData) => void;
}

const LocationCard = ({
  location: propLocation,
  timestamp: propTimestamp,
  className = "",
  onLocationChange,
}: LocationCardProps) => {
  const [location, setLocation] = useState(propLocation || "Auto-detecting location...");
  const [timestamp, setTimestamp] = useState<string>(propTimestamp || "");

  useEffect(() => {
    if (propLocation) {
      setLocation(propLocation);
    }
  }, [propLocation]);

  useEffect(() => {
    if (propTimestamp) {
      setTimestamp(propTimestamp);
    }
  }, [propTimestamp]);

  useEffect(() => {
    // If location is provided as a prop, don't auto-detect location
    if (propLocation) return;

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
          const response = await fetch(
            `${API_BASE_URL}/api/location/reverse?lat=${latitude}&lon=${longitude}`
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
  }, [propLocation, onLocationChange]);

  return (
    <Card className={`border-accent/20 bg-gradient-to-r from-accent/5 to-secondary/5 ${className}`}>
      <CardContent className="p-4 flex justify-between">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-accent-foreground mt-1" />
          <div>
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-sm text-muted-foreground">{location}</p>
            {timestamp && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
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
