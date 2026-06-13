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
import { FileText, CheckCircle2, QrCode, Loader2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const ReportIssue = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Read zone from query params
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

  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.type || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!locationData) {
      toast.error("GPS location not detected yet. Please allow location access.");
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");
      const formDataPayload = new FormData();
      
      formDataPayload.append("title", formData.title);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("type", formData.type);
      formDataPayload.append("zone", zone || "Unknown Zone");
      formDataPayload.append("location", JSON.stringify(locationData));

      if (formData.image) {
        formDataPayload.append("images", formData.image);
      }

      if (formData.voiceNote) {
        formDataPayload.append("voiceNote", formData.voiceNote, "recording.webm");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/complaints`,
        {
          method: "POST",
          headers: {
            // DO NOT set Content-Type header when using FormData; the browser sets it automatically with the boundary!
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formDataPayload
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Submission failed");
      }

      toast.success("Complaint submitted successfully!");

      navigate(`/confirmation/${data.complaintId}`, {
        state: { complaintData: data }
      });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to submit report. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large (max 10MB).");
      return;
    }
    setFormData(prev => ({ ...prev, image: file }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto max-w-2xl relative z-10 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
            <QrCode className="h-5 w-5 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
            File Civic Report
          </h1>

          {zone ? (
            <p className="text-sm text-slate-400">
              Auto-filled Location: <strong className="text-indigo-400">{zone}</strong>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              No QR zone scanned. Reporting for general area.
            </p>
          )}
        </div>

        {/* GPS Location */}
        <LocationCard onLocationChange={(data: LocationData) => {
          setLocationData(data);
        }} />

        {/* Form */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-bold">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span>Issue Details</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Complete the fields below. Our AI service will automatically audit details for categorization and duplicates.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Issue Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-indigo-500"
                  placeholder="Summarize the problem (e.g. Garbage overflowing near post)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Issue Category *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 focus:ring-indigo-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="garbage">Garbage / Trash</SelectItem>
                    <SelectItem value="water">Water Leakage</SelectItem>
                    <SelectItem value="streetlight">Street Light Outage</SelectItem>
                    <SelectItem value="road">Road Damage</SelectItem>
                    <SelectItem value="potholes">Potholes</SelectItem>
                    <SelectItem value="waterlogging">Waterlogging</SelectItem>
                    <SelectItem value="other">Other Civic Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  required
                  disabled={isSubmitting}
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-indigo-500 min-h-[100px]"
                  placeholder="Provide details about the issue. Explicit indicators of hazard or emergency will auto-escalate ticket priority."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Photo Evidence</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                  className="bg-slate-950 border-slate-800 text-slate-400 file:bg-slate-800 file:text-slate-200 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 file:hover:bg-slate-750 cursor-pointer"
                />
                {formData.image && (
                  <p className="text-xs text-slate-400 italic">
                    Selected: {formData.image.name} ({(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block mb-2">Voice Note Evidence</Label>
                <VoiceRecorder
                  onVoiceRecorded={(blob: Blob) =>
                    setFormData(prev => ({ ...prev, voiceNote: blob }))
                  }
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting & running audits...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Footer Notice */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-normal">
            Your complaint details, location (GPS), and media uploads are cryptographically validated and logged to promote transparent civic auditing.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReportIssue;
