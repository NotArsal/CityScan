import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Copy,
  MapPin,
  Clock,
  Building,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
  Mic,
  AlertTriangle,
  Play
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { toast } from "sonner";

interface Complaint {
  complaintId: string;
  title: string;
  type: string;
  description: string;
  status: string;
  department?: string;
  priority?: string;
  estimatedResolution?: string;
  imageUrls?: string[];
  voiceNoteUrl?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export const ConfirmationPage = () => {
  const { complaintId } = useParams();
  const [complaintData, setComplaintData] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!complaintId) return;

    const getComplaint = async () => {
      try {
        const res = await apiFetch(`/api/complaints/${complaintId}`);
        if (res.ok) {
          const data = await res.json();
          setComplaintData(data);
        } else {
          toast.error("Failed to load complaint data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load complaint details. Network error.");
      } finally {
        setLoading(false);
      }
    };

    getComplaint();
  }, [complaintId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Complaint ID copied to clipboard!");
    } catch {
      toast.error("Failed to copy ID. Copy manually.");
    }
  };

  const getPriorityColor = (prio?: string) => {
    switch (prio) {
      case "High": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Low": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          <p className="text-sm font-medium animate-pulse text-slate-400">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaintData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
        <Card className="border-slate-800 bg-slate-900/40 text-center p-6 max-w-sm">
          <CardContent className="space-y-4 pt-6">
            <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold">Complaint Not Found</h3>
            <p className="text-slate-400 text-sm">We couldn't retrieve details for this Complaint ID.</p>
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500">
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto max-w-2xl relative z-10 space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-white bg-clip-text text-transparent">
            Report Logged Successfully
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your complaint has been validated and auto-assigned for audit resolution.
          </p>
        </div>

        {/* Complaint ID Copy Card */}
        <Card className="border-emerald-500/10 bg-emerald-500/5 backdrop-blur-md">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Complaint Tracking ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-mono font-bold text-emerald-400 bg-slate-950/80 px-4 py-1.5 rounded-lg border border-slate-800">
                {complaintData.complaintId}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(complaintData.complaintId)}
                className="border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader className="border-b border-slate-800/40 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xl font-bold">{complaintData.title}</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">Review of logged ticket parameters</CardDescription>
              </div>
              <div className="flex gap-2 self-start sm:self-center">
                <Badge variant="outline" className="bg-indigo-500/5 text-indigo-300 border-indigo-500/20 uppercase text-[10px]">
                  {complaintData.type}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(complaintData.priority)}>
                  {complaintData.priority} Priority
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            
            {/* Metadata Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              {complaintData.location && (
                <>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Address</p>
                      <p className="text-sm text-slate-200 mt-0.5 leading-snug">{complaintData.location.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4.5 w-4.5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Submitted On</p>
                      <p className="text-sm text-slate-200 mt-0.5">{new Date(complaintData.location.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}

              {complaintData.department && (
                <div className="flex items-start gap-2.5">
                  <Building className="h-4.5 w-4.5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Department</p>
                    <p className="text-sm text-slate-200 mt-0.5">{complaintData.department}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-slate-800/40" />

            {/* Description */}
            <div>
              <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                {complaintData.description}
              </p>
            </div>

            {/* Photo / Audio Evidence */}
            {((complaintData.imageUrls && complaintData.imageUrls.length > 0) || complaintData.voiceNoteUrl) && (
              <>
                <Separator className="bg-slate-800/40" />
                <div className="space-y-4">
                  <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Evidence Files</p>
                  
                  {/* Photo Evidence */}
                  {complaintData.imageUrls && complaintData.imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-indigo-400" /> Photo Uploads
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {complaintData.imageUrls.map((url, i) => (
                          <div key={i} className="rounded-lg overflow-hidden border border-slate-800 aspect-video bg-slate-950 relative group">
                            <img src={url} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-all"
                            >
                              Open Full Image
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voice Note Evidence */}
                  {complaintData.voiceNoteUrl && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-indigo-400" /> Voice Note Recording
                      </p>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
                        <audio src={complaintData.voiceNoteUrl} controls className="w-full h-10 accent-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex-1 sm:flex-none">
            <Link to="/track" className="flex items-center gap-1.5 justify-center">
              Track Complaint <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="border-slate-850 bg-slate-900 text-slate-300 hover:text-white" asChild>
            <Link to="/report">File Another Incident</Link>
          </Button>
          <Button variant="outline" className="border-slate-850 bg-slate-900 text-slate-300 hover:text-white" asChild>
            <Link to="/">Dashboard Home</Link>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationPage;
