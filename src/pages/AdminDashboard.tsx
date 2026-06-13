import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Building,
  MapPin,
  Mic,
  Image as ImageIcon,
  Activity,
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  TrendingUp
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

interface UserSummary {
  displayName: string;
  email: string;
  avatar?: string;
}

interface MLPrediction {
  category: string;
  confidence: number;
  department: string;
  urgencyScore: number;
  isDuplicate: boolean;
  similarComplaintId: string;
}

interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  type: string;
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  department: string;
  zone: string;
  userId?: UserSummary;
  location: LocationData;
  priority: "Low" | "Medium" | "High";
  estimatedResolution?: string;
  rewardGiven: boolean;
  imageUrls: string[];
  voiceNoteUrl: string;
  mlPrediction?: MLPrediction;
  createdAt: string;
  progressHistory?: Array<{ status: string; updatedAt: string; notes?: string }>;
}

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [detailsComplaint, setDetailsComplaint] = useState<Complaint | null>(null);
  const [updateComplaint, setUpdateComplaint] = useState<Complaint | null>(null);
  const [statusDraft, setStatusDraft] = useState<"Pending" | "In Progress" | "Resolved" | "Rejected">("Pending");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  // Stats summary (calculated dynamically or fetched)
  const [statsSummary, setStatsSummary] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus !== "all" ? `&status=${selectedStatus}` : "";
      const zoneParam = selectedZone !== "all" ? `&zone=${selectedZone}` : "";
      const searchParam = searchQuery ? `&userId=${searchQuery}` : ""; // search can populate differently, let's filter in frontend if needed or use pagination

      const res = await apiFetch(`/api/complaints?page=${page}&limit=10${statusParam}${zoneParam}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load complaints registry");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiFetch("/api/stats/overview");
      if (res.ok) {
        const data = await res.json();
        setStatsSummary({
          total: data.total,
          pending: data.pending,
          inProgress: data.inProgress,
          resolved: data.resolved
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, selectedStatus, selectedZone]);

  useEffect(() => {
    fetchStats();
  }, [complaints]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Client-side query search on title/id
  const filteredComplaints = complaints.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.complaintId.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const handleStatusUpdateSubmit = async () => {
    if (!updateComplaint) return;
    setIsSubmittingUpdate(true);

    try {
      const res = await apiFetch(`/api/complaints/${updateComplaint.complaintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusDraft, notes: updateNotes })
      });

      if (res.ok) {
        toast.success(`Ticket status updated to ${statusDraft}`);
        setUpdateComplaint(null);
        setUpdateNotes("");
        fetchComplaints();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error during status update");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const getPriorityColor = (prio?: string) => {
    switch (prio) {
      case "High": return "bg-rose-500/10 text-rose-400 border-rose-500/25";
      case "Low": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      default: return "bg-amber-500/10 text-amber-400 border-amber-500/25";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
              Admin Control Panel
            </h1>
            <p className="text-sm text-slate-400">
              Audit reported civic anomalies, verify ML routing, and log resolution states.
            </p>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Active Tickets", val: statsSummary.total, icon: FileText, color: "text-blue-400" },
            { title: "Pending Review", val: statsSummary.pending, icon: Clock, color: "text-amber-400" },
            { title: "In Progress", val: statsSummary.inProgress, icon: TrendingUp, color: "text-indigo-400" },
            { title: "Resolved Audit", val: statsSummary.resolved, icon: CheckCircle2, color: "text-emerald-400" }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.val}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs Control */}
        <Tabs defaultValue="complaints" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <TabsTrigger value="complaints" className="data-[state=active]:bg-slate-850 data-[state=active]:text-white">Complaints Registrar</TabsTrigger>
          </TabsList>

          {/* Complaints List Registrar Tab */}
          <TabsContent value="complaints" className="space-y-6">
            
            {/* Filters */}
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-48">
                  <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(1); }}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Input
                    placeholder="Filter Zone (e.g. WARD-12)"
                    value={selectedZone === "all" ? "" : selectedZone}
                    onChange={(e) => { setSelectedZone(e.target.value || "all"); setPage(1); }}
                    className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-700"
                  />
                </div>

                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-650" />
                  <Input
                    placeholder="Search complaint title or tracking ID..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="bg-slate-950 border-slate-800 text-slate-100 pl-10 placeholder:text-slate-705 focus-visible:ring-indigo-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Complaint Registry Lists */}
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
              <CardHeader className="border-b border-slate-800/40 pb-4">
                <CardTitle className="text-lg font-bold">Recent Submissions</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Citizen reported issues awaiting administrative review</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 divide-y divide-slate-800/60">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 animate-pulse flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-400" /> Loading registry...
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No matching complaint logs found.
                  </div>
                ) : (
                  filteredComplaints.map(c => (
                    <div key={c._id} className="p-5 hover:bg-slate-900/20 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-200">{c.title}</span>
                          <Badge variant="outline" className={`${getStatusColor(c.status)} uppercase text-[9px]`}>
                            {c.status}
                          </Badge>
                          <Badge variant="outline" className={`${getPriorityColor(c.priority)} uppercase text-[9px]`}>
                            {c.priority} Prio
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-slate-400 font-mono">ID: {c.complaintId} • Zone: {c.zone}</p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-slate-500" /> {c.department}</div>
                          <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500" /> {c.location.address}</div>
                          <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-500" /> {new Date(c.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDetailsComplaint(c)}
                          className="border-slate-800 bg-slate-900 text-slate-350 hover:text-white"
                        >
                          Audit Details
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setUpdateComplaint(c);
                            setStatusDraft(c.status);
                            setUpdateNotes("");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                          Resolve / Audit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <CardFooter className="p-4 border-t border-slate-800/40 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="border-slate-800 text-slate-400"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="border-slate-800 text-slate-400"
                    >
                      Next <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Audit Details Modal (Shadcn Dialog fully styled for dark mode) */}
        {detailsComplaint && (
          <Dialog open={!!detailsComplaint} onOpenChange={(open) => !open && setDetailsComplaint(null)}>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold">{detailsComplaint.title}</DialogTitle>
                  <Badge variant="outline" className={`${getStatusColor(detailsComplaint.status)} uppercase text-[9px]`}>
                    {detailsComplaint.status}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs">Tracking ID: {detailsComplaint.complaintId}</CardDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                
                {/* Citizens / Reporter Information */}
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Reporter Details</p>
                  {detailsComplaint.userId ? (
                    <div>
                      <p className="text-sm font-semibold">{detailsComplaint.userId.displayName}</p>
                      <p className="text-xs text-slate-400">{detailsComplaint.userId.email}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Logged anonymously or profile records missing</p>
                  )}
                </div>

                {/* GPS Address */}
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-350">
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold block mb-1">Address</span>
                    <p className="leading-snug">{detailsComplaint.location.address}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-455 uppercase tracking-wider font-bold block mb-1">Coordinates</span>
                    <p className="font-mono text-slate-400">{detailsComplaint.location.latitude.toFixed(5)}, {detailsComplaint.location.longitude.toFixed(5)}</p>
                  </div>
                </div>

                {/* Department & Priority */}
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-350">
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase tracking-wider font-bold block mb-1">Assigned Department</span>
                    <p>{detailsComplaint.department}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-455 uppercase tracking-wider font-bold block mb-1">Priority Classification</span>
                    <Badge variant="outline" className={`${getPriorityColor(detailsComplaint.priority)} font-bold`}>
                      {detailsComplaint.priority}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-slate-800/60" />

                {/* ML Predictions Box */}
                {detailsComplaint.mlPrediction && (
                  <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-4 w-4" /> ML Pipeline Decision Logs
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-450 text-[10px] block">Detected Class</span>
                        <span className="font-semibold text-slate-200 uppercase">{detailsComplaint.mlPrediction.category || "None"}</span>
                      </div>
                      <div>
                        <span className="text-slate-455 text-[10px] block">Confidence Level</span>
                        <span className="font-semibold text-slate-200">{Math.round((detailsComplaint.mlPrediction.confidence || 0) * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-450 text-[10px] block">Urgency Audit Score</span>
                        <span className={`font-semibold ${detailsComplaint.mlPrediction.urgencyScore > 0.7 ? "text-rose-450" : "text-slate-200"}`}>
                          {detailsComplaint.mlPrediction.urgencyScore.toFixed(2)} / 1.0
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-450 text-[10px] block">Duplicate Check</span>
                        <span className={`font-semibold ${detailsComplaint.mlPrediction.isDuplicate ? "text-rose-400" : "text-emerald-400"}`}>
                          {detailsComplaint.mlPrediction.isDuplicate ? "DUPLICATE FLAG" : "UNIQUE"}
                        </span>
                      </div>
                      {detailsComplaint.mlPrediction.isDuplicate && (
                        <div className="col-span-2">
                          <span className="text-slate-450 text-[10px] block">Similar Ticket ID</span>
                          <span className="font-mono text-rose-350 break-all">{detailsComplaint.mlPrediction.similarComplaintId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Complaint description */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Details</p>
                  <p className="text-sm text-slate-350 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-850">
                    {detailsComplaint.description}
                  </p>
                </div>

                {/* Evidence Files */}
                {((detailsComplaint.imageUrls && detailsComplaint.imageUrls.length > 0) || detailsComplaint.voiceNoteUrl) && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Evidence Attachments</p>
                    
                    {detailsComplaint.imageUrls && detailsComplaint.imageUrls.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-indigo-400" /> Photo uploads
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {detailsComplaint.imageUrls.map((url, i) => (
                            <div key={i} className="rounded-lg overflow-hidden border border-slate-800 aspect-video bg-slate-900 relative group">
                              <img src={url} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                              <a href={url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white">
                                View Full
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {detailsComplaint.voiceNoteUrl && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Mic className="h-3.5 w-3.5 text-indigo-400" /> Voice recording
                        </p>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                          <audio src={detailsComplaint.voiceNoteUrl} controls className="w-full h-10 accent-indigo-500" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                <Button onClick={() => setDetailsComplaint(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-200">
                  Close Audit View
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Update Status Modal (Shadcn Dialog fully styled for dark mode) */}
        {updateComplaint && (
          <Dialog open={!!updateComplaint} onOpenChange={(open) => !open && setUpdateComplaint(null)}>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Update Resolution Status</DialogTitle>
                <CardDescription className="text-slate-400 text-xs">Modifying Ticket: {updateComplaint.complaintId}</CardDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="status-select" className="text-slate-400 text-xs">Audit Status</Label>
                  <Select value={statusDraft} onValueChange={(v) => setStatusDraft(v as any)}>
                    <SelectTrigger id="status-select" className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved (Closes ticket + awards points)</SelectItem>
                      <SelectItem value="Rejected">Rejected (Closes ticket without reward)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes-text" className="text-slate-400 text-xs">Progress Notes / Auditing Remarks</Label>
                  <Textarea
                    id="notes-text"
                    placeholder="Enter audit logs or instructions for the citizen..."
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-700 min-h-[90px]"
                    disabled={isSubmittingUpdate}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setUpdateComplaint(null)} 
                  disabled={isSubmittingUpdate}
                  className="border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdateSubmit} 
                  disabled={isSubmittingUpdate}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {isSubmittingUpdate ? "Saving..." : "Commit Update"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
