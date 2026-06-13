import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Timer,
  Search,
  Building,
  Image as ImageIcon,
  Mic,
  Star,
  CornerDownRight,
  ShieldCheck
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface ProgressStep {
  status: string;
  updatedAt: string;
  notes?: string;
}

interface Feedback {
  rating: number;
  comment: string;
  submittedAt: string;
}

interface ComplaintData {
  complaintId: string;
  title: string;
  description: string;
  location: LocationData;
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  createdAt: string;
  zone?: string;
  priority?: "Low" | "Medium" | "High";
  department?: string;
  estimatedResolution?: string;
  progressHistory?: ProgressStep[];
  feedback?: Feedback;
  imageUrls?: string[];
  voiceNoteUrl?: string;
}

const TrackComplaint = () => {
  const [complaintId, setComplaintId] = useState("");
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [rating, setRating] = useState<string>("");
  const [comment, setComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!complaintId.trim()) {
      setError("Please enter a valid Complaint ID.");
      return;
    }

    setIsLoading(true);
    setError("");
    setComplaintData(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/complaints/${complaintId.trim()}`
      );

      if (!response.ok) {
        throw new Error("Complaint not found");
      }

      const data = await response.json();
      setComplaintData(data);
      toast.success("Ticket loaded successfully");
    } catch (err) {
      setError("Complaint ID not found in database registry.");
      toast.error("Complaint lookup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      toast.error("Please select a valid rating from 1 to 5.");
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const res = await apiFetch(
        `/api/complaints/${complaintData?.complaintId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ rating: numericRating, comment })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to submit feedback");
      } else {
        toast.success("Feedback submitted. Thank you for your evaluation!");
        
        // Update local state smoothly without page refresh
        setComplaintData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            feedback: {
              rating: numericRating,
              comment,
              submittedAt: new Date().toISOString()
            }
          };
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to feedback server.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />;
      case "In Progress":
        return <Timer className="h-4 w-4 text-blue-500" />;
      case "Resolved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "Rejected":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (prio?: string) => {
    switch (prio) {
      case "High": return "bg-rose-500/10 text-rose-450 border-rose-500/20";
      case "Low": return "bg-emerald-500/10 text-emerald-450 border-emerald-500/20";
      default: return "bg-amber-500/10 text-amber-450 border-amber-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "In Progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Resolved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto max-w-2xl relative z-10 space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
            Track Incident Progress
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Audit the resolution path and check the status of your reported complaint.
          </p>
        </div>

        {/* Search Card */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Complaint Registry Lookup</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Enter your unique tracking number (e.g. CVC-XXXXXXXXXXXXX)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="e.g. CVC-1718260400000"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-indigo-500"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                {isLoading ? "Searching..." : <><Search className="h-4 w-4 mr-1.5" /> Lookup</>}
              </Button>
            </form>
            {error && (
              <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results Card */}
        {complaintData && (
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b border-slate-800/40 pb-4 bg-slate-900/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold">{complaintData.title}</CardTitle>
                  <CardDescription className="text-slate-400 text-xs mt-1">Ticket ID: {complaintData.complaintId}</CardDescription>
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                  <Badge variant="outline" className={getStatusColor(complaintData.status)}>
                    <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold">
                      {getStatusIcon(complaintData.status)}
                      {complaintData.status}
                    </span>
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(complaintData.priority)}>
                    {complaintData.priority} Priority
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              
              {/* Info Matrix */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Address</p>
                    <p className="text-sm text-slate-200 mt-0.5 leading-snug">{complaintData.location?.address || "GPS Location"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Submitted On</p>
                    <p className="text-sm text-slate-200 mt-0.5">{new Date(complaintData.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {complaintData.department && (
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Department Assigned</p>
                      <p className="text-sm text-slate-200 mt-0.5">{complaintData.department}</p>
                    </div>
                  </div>
                )}

                {complaintData.estimatedResolution && (
                  <div className="flex items-start gap-2">
                    <Timer className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Estimated Resolution</p>
                      <p className="text-sm text-slate-200 mt-0.5">
                        {new Date(complaintData.estimatedResolution).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-800/40" />

              {/* Description */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Details</p>
                <p className="text-sm text-slate-350 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50 leading-relaxed">
                  {complaintData.description}
                </p>
              </div>

              {/* Photos & Audio Evidence */}
              {((complaintData.imageUrls && complaintData.imageUrls.length > 0) || complaintData.voiceNoteUrl) && (
                <>
                  <Separator className="bg-slate-800/40" />
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Evidence Uploads</p>

                    {complaintData.imageUrls && complaintData.imageUrls.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-indigo-400" /> Image files
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {complaintData.imageUrls.map((url, i) => (
                            <div key={i} className="rounded-lg overflow-hidden border border-slate-800 aspect-video bg-slate-950 relative group">
                              <img src={url} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-all font-medium"
                              >
                                View Full
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {complaintData.voiceNoteUrl && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Mic className="h-3.5 w-3.5 text-indigo-400" /> Voice recording
                        </p>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <audio src={complaintData.voiceNoteUrl} controls className="w-full h-10 accent-indigo-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator className="bg-slate-800/40" />

              {/* Progress Timeline */}
              {complaintData.progressHistory && complaintData.progressHistory.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Progress Logs</p>
                  <div className="space-y-4 relative pl-4 border-l border-slate-800 ml-1.5">
                    {complaintData.progressHistory.map((step, index) => (
                      <div key={index} className="relative space-y-1">
                        {/* Dot indicator */}
                        <div className="absolute -left-[20.5px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-200">{step.status}</span>
                          <span className="text-[10px] text-slate-500">{new Date(step.updatedAt).toLocaleString()}</span>
                        </div>
                        {step.notes && (
                          <p className="text-xs text-slate-400 flex items-start gap-1">
                            <CornerDownRight className="h-3 w-3 text-slate-600 mt-0.5 shrink-0" /> {step.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Submitted Log */}
              {complaintData.feedback && (
                <>
                  <Separator className="bg-slate-800/40" />
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> Logged User Evaluation
                    </p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < (complaintData.feedback?.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} 
                        />
                      ))}
                    </div>
                    {complaintData.feedback.comment && (
                      <p className="text-xs text-slate-300 italic">"{complaintData.feedback.comment}"</p>
                    )}
                  </div>
                </>
              )}

              {/* Submit Feedback Section */}
              {complaintData.status === "Resolved" && !complaintData.feedback && (
                <>
                  <Separator className="bg-slate-800/40" />
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-250 text-sm">Resolution Feedback</h4>
                      <p className="text-slate-400 text-xs">Verify resolution satisfaction below. Citizens earn points on audit closure.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rating-select" className="text-slate-400 text-xs">Rating Evaluation</Label>
                      <Select value={rating} onValueChange={setRating} disabled={isSubmittingFeedback}>
                        <SelectTrigger id="rating-select" className="bg-slate-950 border-slate-800 text-slate-100">
                          <SelectValue placeholder="Select Rating" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                          <SelectItem value="5">5 - Excellent</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="3">3 - Average</SelectItem>
                          <SelectItem value="2">2 - Bad</SelectItem>
                          <SelectItem value="1">1 - Very Bad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comment-text" className="text-slate-400 text-xs">Additional Comments</Label>
                      <Textarea
                        id="comment-text"
                        placeholder="Write your feedback..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-700 min-h-[80px]"
                        disabled={isSubmittingFeedback}
                      />
                    </div>

                    <Button 
                      onClick={submitFeedback} 
                      disabled={isSubmittingFeedback || !rating}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold text-white"
                    >
                      {isSubmittingFeedback ? "Submitting..." : "Submit Verification Feedback"}
                    </Button>
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default TrackComplaint;
