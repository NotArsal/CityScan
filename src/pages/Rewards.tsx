import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Rewards = () => {
  const [points, setPoints] = useState<number>(0);
  const [claimPoints, setClaimPoints] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Replace with actual Firebase UID later
  const firebaseUid = localStorage.getItem("firebaseUid") || "demo-user";

  const fetchPoints = async () => {
    try {
      const res = await fetch(
        `https://public-eye-backend.onrender.com/api/rewards/${firebaseUid}`
      );
      const data = await res.json();
      setPoints(data.points || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleClaim = async () => {
    if (!claimPoints || Number(claimPoints) <= 0) {
      alert("Enter valid points");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://public-eye-backend.onrender.com/api/rewards/claim`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseUid,
            points: Number(claimPoints),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
      } else {
        alert("Reward claimed successfully!");
        setClaimPoints("");
        fetchPoints();
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">

        <h1 className="text-3xl font-bold text-center">
          Rewards & Points
        </h1>

        {/* Points Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Points</CardTitle>
            <CardDescription>
              Earn points when your complaints get resolved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center text-primary">
              {points}
            </div>
          </CardContent>
        </Card>

        {/* Claim Card */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Rewards</CardTitle>
            <CardDescription>
              Redeem your points for rewards or cash withdrawal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Enter points to claim"
              value={claimPoints}
              onChange={(e) => setClaimPoints(e.target.value)}
            />

            <Button onClick={handleClaim} disabled={loading}>
              {loading ? "Processing..." : "Claim Points"}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <p className="text-sm text-muted-foreground text-center">
          10 points = ₹10 equivalent (example conversion logic)
        </p>

      </div>
    </div>
  );
};

export default Rewards;
