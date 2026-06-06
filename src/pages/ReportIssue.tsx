import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationCard from "@/components/LocationCard";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle2, QrCode } from "lucide-react";

/* ✅ Proper Type for GPS Data */
interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const ReportIssue = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { toast } = useToast();

  /* ✅ Read zone from QR */
  const queryParams = new URLSearchParams(routerLocation.search);
  const zone = queryParams.get("zone");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<{
    title: string;
    type: string;
    description: string;
    image: File | null;
    voiceNote: Blob | null;
  }>({
    title: "",
    type: "",
    description: "",
    image: null,
    voiceNote: null
  });

  /* ✅ Typed location state */
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.type || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!locationData) {
      toast({
        title: "Location Not Ready",
        description: "Waiting for GPS detection. Please allow location access.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "https://public-eye-backend.onrender.com/api/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            zone: zone || "Unknown Zone",
            status: "Pending",
            location: locationData
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Submission failed");
      }

      toast({
        title: "Complaint Submitted Successfully!",
        description: `Your Complaint ID is ${data.complaintId}`
      });

      navigate(`/confirmation/${data.complaintId}`, {
        state: { complaintData: data }
      });

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not connect to server.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">QR-Triggered Reporting</h1>

          {zone && (
            <p className="text-sm text-muted-foreground">
              Reporting for Zone: <strong>{zone}</strong>
            </p>
          )}
        </div>

        {/* GPS Location */}
        <LocationCard onLocationChange={(data: LocationData) => {
          setLocationData(data);
        }} />

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Issue Details</span>
            </CardTitle>
            <CardDescription>
              Submit your civic issue below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label>Issue Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Issue Category *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="water">Water Leakage</SelectItem>
                    <SelectItem value="streetlight">Street Light</SelectItem>
                    <SelectItem value="road">Road Damage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Photo Evidence</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {formData.image && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>

              <VoiceRecorder
                onVoiceRecorded={(blob: Blob) =>
                  setFormData(prev => ({ ...prev, voiceNote: blob }))
                }
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Footer Notice */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4 flex items-center space-x-3">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm">
              GPS verified and securely stored in database.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ReportIssue;
