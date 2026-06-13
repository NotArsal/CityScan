import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { API_BASE_URL } from "../config";
import { 
  Building, 
  BarChart3, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Shield,
  Eye,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";

interface OverviewStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  resolutionRate: number;
}

interface ZoneStat {
  zone: string;
  total: number;
  resolved: number;
  pending: number;
}

interface TypeStat {
  type: string;
  count: number;
  percentage: number;
}

interface DeptStat {
  department: string;
  total: number;
  resolved: number;
  rate: number;
}

interface TrendStat {
  week: string;
  submitted: number;
  resolved: number;
}

export const TransparencyDashboard = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [zones, setZones] = useState<ZoneStat[]>([]);
  const [types, setTypes] = useState<TypeStat[]>([]);
  const [departments, setDepartments] = useState<DeptStat[]>([]);
  const [trends, setTrends] = useState<TrendStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [overviewRes, zonesRes, typesRes, deptsRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stats/overview`),
        fetch(`${API_BASE_URL}/api/stats/by-zone`),
        fetch(`${API_BASE_URL}/api/stats/by-type`),
        fetch(`${API_BASE_URL}/api/stats/by-department`),
        fetch(`${API_BASE_URL}/api/stats/trends`)
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (zonesRes.ok) setZones(await zonesRes.json());
      if (typesRes.ok) setTypes(await typesRes.json());
      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (trendsRes.ok) setTrends(await trendsRes.json());

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      toast.error("Failed to load real-time analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getEfficiencyColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-400";
    if (rate >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-emerald-500";
    if (rate >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-indigo-400" />
          <p className="text-sm font-medium animate-pulse text-slate-400">Compiling real-time registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Eye className="h-6 w-6 text-indigo-400" />
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
                Transparency Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-xl">
              Public registry and performance audits of civic resolution workflows.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-indigo-500/5 border-indigo-500/20 text-indigo-300 py-1.5 px-3">
              <Shield className="h-4 w-4 mr-1.5" /> RTI Open Initiative
            </Badge>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
              variant="outline"
              className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total complaints", val: overview?.total || 0, icon: FolderOpen, color: "text-blue-400" },
            { label: "Resolved cases", val: overview?.resolved || 0, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Under investigation", val: overview?.inProgress || 0, icon: Clock, color: "text-amber-400" },
            { label: "Unassigned/Pending", val: overview?.pending || 0, icon: AlertTriangle, color: "text-rose-400" },
            { label: "Resolution rate", val: `${overview?.resolutionRate || 0}%`, icon: Activity, color: "text-violet-400" },
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <Card key={idx} className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{m.label}</span>
                    <Icon className={`h-4 w-4 ${m.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-slate-100 mt-2">{typeof m.val === "number" ? m.val.toLocaleString() : m.val}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts & Graphs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chart 1: Trends */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-200">Incident Registration Trends</CardTitle>
              <CardDescription className="text-xs text-slate-400">Weekly intake vs resolution throughput</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pb-6">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="submitted" name="Intake" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                  Insufficient timeline logs to compile trend analysis.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Category Breakdown */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-200">Volume by Incident Type</CardTitle>
              <CardDescription className="text-xs text-slate-400">Total reported cases segmented by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pb-6">
              {types.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={types} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="type" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9" }} />
                    <Bar dataKey="count" name="Reports" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                  No categorical reports submitted yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabular Lists */}
        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <TabsTrigger value="departments" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Department Audit</TabsTrigger>
            <TabsTrigger value="zones" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Zone Registers</TabsTrigger>
          </TabsList>

          {/* Tab 1: Department Efficiency */}
          <TabsContent value="departments">
            <Card className="border-slate-800/80 bg-slate-900/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-200">Department Resolution Metrics</CardTitle>
                <CardDescription className="text-xs text-slate-400">Audit of administrative response rates and efficiency quotients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {departments.length > 0 ? (
                  departments.map((dept, index) => (
                    <div key={index} className="border border-slate-800 bg-slate-900/40 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-slate-200">{dept.department}</h4>
                          <p className="text-xs text-slate-400">
                            Resolved {dept.resolved.toLocaleString()} out of {dept.total.toLocaleString()} total incidents
                          </p>
                        </div>
                        <Badge className={`${getEfficiencyColor(dept.rate)} bg-slate-950 border-slate-800`} variant="outline">
                          {dept.rate}% resolution rate
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                          <div 
                            className={`${getProgressColor(dept.rate)} h-full rounded-full transition-all duration-700`}
                            style={{ width: `${dept.rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    No department statistics compiled.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Zone performance */}
          <TabsContent value="zones">
            <Card className="border-slate-800/80 bg-slate-900/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-200">Zone-wise Registers</CardTitle>
                <CardDescription className="text-xs text-slate-400">Intake volumes and status distributions across wards</CardDescription>
              </CardHeader>
              <CardContent>
                {zones.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Zone ID</th>
                          <th className="px-6 py-3 font-semibold">Total Intake</th>
                          <th className="px-6 py-3 font-semibold">Resolved</th>
                          <th className="px-6 py-3 font-semibold">Unresolved/Pending</th>
                          <th className="px-6 py-3 font-semibold">Audit Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {zones.map((z, idx) => {
                          const rate = z.total > 0 ? Math.round((z.resolved / z.total) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="px-6 py-4 font-semibold text-slate-100 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-indigo-400" /> {z.zone}
                              </td>
                              <td className="px-6 py-4">{z.total}</td>
                              <td className="px-6 py-4 text-emerald-400">{z.resolved}</td>
                              <td className="px-6 py-4 text-rose-400">{z.pending}</td>
                              <td className="px-6 py-4">
                                <span className={`font-bold ${getEfficiencyColor(rate)}`}>
                                  {rate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    No zone statistics recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-slate-900/20 border-slate-850">
          <CardContent className="p-6 text-center text-xs text-slate-500 space-y-1">
            <p>Audited in real-time by CityScan engine • Last synced: {new Date().toLocaleString()}</p>
            <p>Data provided here is public record to support citizen audits. Safeguards are in place to mask individual user PII.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TransparencyDashboard;