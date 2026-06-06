import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Copy,
  Download,
  Share2,
  MapPin,
  Clock,
  Building,
  FileText,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  complaintId: string;
  title: string;
  type: string;
  description: string;
  status: string;
  department?: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

const ConfirmationPage = () => {
  const { complaintId } = useParams();
  const { toast } = useToast();

  const [complaintData, setComplaintData] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!complaintId) return;

    fetch(`https://public-eye-backend.onrender.com/api/complaints/${complaintId}`)
      .then(res => res.json())
      .then(data => {
        setComplaintData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [complaintId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Complaint ID copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the ID manually",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading complaint details...</p>
      </div>
    );
  }

  if (!complaintData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Complaint not found.</p>
            <Button asChild className="mt-4">
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">

        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-success">
            Complaint Submitted Successfully!
          </h1>
        </div>

        {/* Complaint ID */}
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">Your Complaint ID</p>
            <div className="flex items-center justify-center space-x-2">
              <code className="text-2xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                {complaintData.complaintId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(complaintData.complaintId)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Summary</CardTitle>
            <CardDescription>Review your complaint details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            <div>
              <h3 className="font-semibold text-lg">{complaintData.title}</h3>
              <div className="flex gap-2 mt-2">
                <Badge>{complaintData.type}</Badge>
                <Badge variant="secondary">{complaintData.status}</Badge>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">

              {complaintData.location && (
                <>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {complaintData.location.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {complaintData.location.timestamp}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {complaintData.department && (
                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Assigned Department</p>
                    <p className="text-sm text-muted-foreground">
                      {complaintData.department}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <p className="font-medium text-sm mb-2">Description</p>
              <p className="text-sm text-muted-foreground">
                {complaintData.description}
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/track">Track Complaint</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/report">Report Another Issue</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationPage;
