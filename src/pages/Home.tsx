import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LocationCard from "@/components/LocationCard";
import { 
  FileText, 
  MapPin, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  QrCode,
  Smartphone,
  Zap,
  Bell,
  TrendingUp
} from "lucide-react";

const Home = () => {
  const [location, setLocation] = useState<string>("Detecting location...");
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    setTimestamp(new Date().toLocaleString());

    const updateLocationFromCoords = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              // Best-effort identification; some providers prefer a proper UA/Referer
              "Accept": "application/json"
            }
          }
        );
        if (!response.ok) {
          throw new Error("Reverse geocoding failed");
        }
        const data = await response.json();
        const displayName: string | undefined = data?.display_name;
        if (displayName && displayName.length > 0) {
          setLocation(displayName);
        } else {
          setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
      } catch (_err) {
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    };

    const requestGeolocation = () => {
      if (!("geolocation" in navigator)) {
        setLocation("Geolocation not supported by this browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocationFromCoords(latitude, longitude);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocation("Location permission denied. Please allow access.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocation("Location unavailable. Try again.");
              break;
            case error.TIMEOUT:
              setLocation("Location request timed out. Try again.");
              break;
            default:
              setLocation("Unable to fetch location.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    };

    requestGeolocation();
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Easy Reporting",
      description: "Report civic issues quickly with our simple form",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: MapPin,
      title: "GPS Location",
      description: "Automatic location tagging for precise issue tracking",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with government-grade security",
      color: "bg-success/10 text-success"
    },
    {
      icon: Users,
      title: "Public Transparency",
      description: "Track progress and view public complaint statistics",
      color: "bg-warning/10 text-warning"
    }
  ];

  const stats = [
    { label: "Total Complaints", value: "12,847", icon: FileText, trend: "+8%" },
    { label: "Resolved This Month", value: "3,245", icon: CheckCircle, trend: "+15%" },
    { label: "In Progress", value: "892", icon: Clock, trend: "-5%" },
    { label: "Active Cities", value: "156", icon: MapPin, trend: "+12%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1.5 text-sm">
              <QrCode className="h-4 w-4 mr-2" />
              CityScan - QR Access Detected
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-gov-blue-light bg-clip-text text-transparent leading-tight">
              QR-Triggered Civic Reporting
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Scan QR codes every 1-2 km across your city. Auto-capture location, timestamp, and report issues instantly with AI-powered classification.
            </p>
          </div>

          <LocationCard 
            location={location} 
            timestamp={timestamp}
            className="max-w-md mx-auto"
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-gov-blue-light text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto"
              asChild
            >
              <Link to="/report">
                <QrCode className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Scan & Report
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto" asChild>
              <Link to="/track">
                <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Track Status
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">CityScan Smart Features</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Advanced QR-triggered reporting with auto-capture and AI classification
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: QrCode, title: "QR Scanning", desc: "Scan codes placed every 1-2 km across the city", color: "bg-accent/20 text-accent" },
              { icon: Zap, title: "Auto-Capture", desc: "Automatic location, timestamp, and device metadata", color: "bg-primary/20 text-primary" },
              { icon: TrendingUp, title: "AI Sorting", desc: "Image classification for smart department routing", color: "bg-gov-teal/20 text-gov-teal" },
              { icon: Bell, title: "Live Tracking", desc: "Push notifications and WhatsApp updates", color: "bg-gov-orange/20 text-gov-orange" }
            ].map((feature, index) => (
              <Card key={index} className="border-accent/20 hover:shadow-md transition-all duration-300">
                <CardHeader className="text-center pb-3 md:pb-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${feature.color} flex items-center justify-center mx-auto mb-2 md:mb-3`}>
                    <feature.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <CardTitle className="text-base md:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-sm">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">Simple 4-Step Process</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                From QR scan to resolution - streamlined civic engagement
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { step: "1", title: "Scan QR", desc: "Find QR codes placed strategically across the city", icon: QrCode },
                { step: "2", title: "Capture Data", desc: "Take photo, add voice note, auto-capture location", icon: Smartphone },
                { step: "3", title: "AI Routing", desc: "Automatic classification and department assignment", icon: TrendingUp },
                { step: "4", title: "Track Progress", desc: "Real-time updates from received to resolved", icon: Clock }
              ].map((item) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="mx-auto flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base">
                    {item.step}
                  </div>
                  <div className="flex justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                      <item.icon className="h-4 w-4 text-accent-foreground" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{item.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Making Impact Nationwide</h2>
            <p className="text-muted-foreground">
              Real-time statistics from our civic engagement platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to make a difference?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of citizens who are actively improving their communities. 
              Report issues, track progress, and see the transparency in action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-primary to-gov-blue-light" asChild>
                <Link to="/report">Start Reporting</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/transparency">View Public Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home;