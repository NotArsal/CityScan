import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Filter,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";

interface BackendComplaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  type?: string;
  zone?: string;
  status?: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
}

const AdminDashboard = () => {
  const [backendComplaints, setBackendComplaints] = useState<BackendComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [detailsComplaint, setDetailsComplaint] = useState<any>(null);
  const [updateComplaint, setUpdateComplaint] = useState<any>(null);
  const [statusDraft, setStatusDraft] =
    useState<"Pending" | "In Progress" | "Resolved">("Pending");

  // 🔥 Fetch complaints
  useEffect(() => {
    fetch("https://public-eye-backend.onrender.com/api/complaints")
      .then(res => res.json())
      .then(data => {
        setBackendComplaints(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 🔥 Transform backend data
  const complaints = useMemo(() => {
    return backendComplaints.map(c => ({
      id: c.complaintId ?? "",
      title: c.title ?? "Untitled",
      type: c.type ?? "General",
      city: "Pune",
      department: `${c.type ?? "General"} Department`,
      status: c.status ?? "Pending",
      date: c.createdAt
        ? new Date(c.createdAt).toISOString().split("T")[0]
        : "-",
      description: c.description ?? "No description provided"
    }));
  }, [backendComplaints]);

  // 🔥 Stats
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;

  const stats = [
    { title: "Total Complaints", value: total, icon: FileText },
    { title: "Pending Review", value: pending, icon: Clock },
    { title: "In Progress", value: inProgress, icon: TrendingUp },
    { title: "Resolved", value: resolved, icon: CheckCircle2 }
  ];

  // 🔥 Filter logic (SAFE)
  const filteredComplaints = complaints.filter(c => {
    const q = searchQuery.toLowerCase();
    const statusOk = selectedStatus === "all" || c.status === selectedStatus;

    const searchOk =
      (c.id ?? "").toLowerCase().includes(q) ||
      (c.title ?? "").toLowerCase().includes(q);

    return statusOk && searchOk;
  });

  // 🔥 Update status
  const handleStatusUpdate = async () => {
    if (!updateComplaint) return;

    await fetch(
      `https://public-eye-backend.onrender.com/api/complaints/${updateComplaint.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusDraft })
      }
    );

    setBackendComplaints(prev =>
      prev.map(c =>
        c.complaintId === updateComplaint.id
          ? { ...c, status: statusDraft }
          : c
      )
    );

    setUpdateComplaint(null);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading complaints...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and monitor civic complaints across all cities
            </p>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="complaints">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="complaints">Complaints Management</TabsTrigger>
            <TabsTrigger value="analytics">City Analytics</TabsTrigger>
            <TabsTrigger value="heatmap">Complaint Heatmap</TabsTrigger>
          </TabsList>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Search complaints..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Complaint List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Complaints</CardTitle>
                <CardDescription>
                  Latest complaints submitted across all cities
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {filteredComplaints.map(c => (
                  <div key={c.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{c.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          ID: {c.id}
                        </p>
                      </div>
                      <Badge>{c.status}</Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Type:</span><p>{c.type}</p></div>
                      <div><span className="text-muted-foreground">City:</span><p>{c.city}</p></div>
                      <div><span className="text-muted-foreground">Department:</span><p>{c.department}</p></div>
                      <div><span className="text-muted-foreground">Date:</span><p>{c.date}</p></div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setDetailsComplaint(c)}>
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => {
                        setUpdateComplaint(c);
                        setStatusDraft(c.status);
                      }}>
                        Update Status
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>City Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total Complaints in Pune: {total}</p>
                <p>Pending: {pending}</p>
                <p>In Progress: {inProgress}</p>
                <p>Resolved: {resolved}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heatmap */}
          <TabsContent value="heatmap">
            <Card>
              <CardHeader>
                <CardTitle>Complaint Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Heatmap feature remains here (UI preserved).</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* View Modal */}
        {detailsComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="font-semibold mb-2">Complaint Details</h3>
              <p><strong>ID:</strong> {detailsComplaint.id}</p>
              <p><strong>Description:</strong> {detailsComplaint.description}</p>
              <Button className="mt-4" onClick={() => setDetailsComplaint(null)}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {updateComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 space-y-4">
              <h3 className="font-semibold">Update Complaint</h3>

              <Select value={statusDraft} onValueChange={(v) =>
                setStatusDraft(v as "Pending" | "In Progress" | "Resolved")
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setUpdateComplaint(null)}>
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
