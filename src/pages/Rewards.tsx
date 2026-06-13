import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../lib/api";
import { Coins, Gift, ShieldAlert, BadgeInfo, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Rewards = () => {
  const { user, refreshUser } = useAuth();
  const [points, setPoints] = useState<number>(user?.points || 0);
  const [claimPoints, setClaimPoints] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPoints = async () => {
    try {
      const res = await apiFetch("/api/rewards");
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points || 0);
      }
    } catch (err) {
      console.error("Fetch Points Error:", err);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleClaim = async () => {
    const pts = parseInt(claimPoints, 10);
    if (isNaN(pts) || pts <= 0 || !Number.isInteger(pts)) {
      toast.error("Please enter a valid positive integer for points.");
      return;
    }

    if (pts > points) {
      toast.error("Insufficient points balance.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/rewards/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points: pts }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Claim failed");
      } else {
        toast.success(`Successfully claimed ${pts} points!`);
        setClaimPoints("");
        fetchPoints();
        // Refresh the global auth state to update navbar balance
        await refreshUser();
      }
    } catch (err) {
      console.error("Claim Error:", err);
      toast.error("Failed to process claim. Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto max-w-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
            Civic Rewards Ledger
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Redeem points earned by reporting issues that improve our city's infrastructure.
          </p>
        </div>

        {/* Points Card */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <CardDescription className="text-slate-400 uppercase tracking-wider text-xs font-semibold">
              Available Balance
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Coins className="h-10 w-10 text-amber-400 animate-pulse" />
              <CardTitle className="text-5xl font-extrabold text-amber-300">{points}</CardTitle>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Equates to approximately <span className="font-semibold text-emerald-400">₹{points * 1.0}</span> in civic vouchers
            </p>
          </CardHeader>
        </Card>

        {/* Claim Card */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-indigo-400" /> Claim Reward Voucher
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Points are converted to digital gift vouchers. Enter amount to redeem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Enter points to claim (e.g. 50)"
                value={claimPoints}
                onChange={(e) => setClaimPoints(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-indigo-500"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleClaim} 
              disabled={loading || !claimPoints}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Claim...
                </>
              ) : (
                "Claim Voucher"
              )}
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-900/20 border-t border-slate-800/40 px-6 py-4 flex items-start gap-2.5">
            <BadgeInfo className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-normal">
              Claims are processed instantly. Once claimed, a digital coupon code will be generated and logged under your profile registry.
            </p>
          </CardFooter>
        </Card>

        <Separator className="bg-slate-800/60" />

        <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-xs text-slate-400">
            Reporting verified issues yields <span className="font-semibold text-slate-200">10 points</span> per resolved ticket. Help keep your city clean and safe!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
