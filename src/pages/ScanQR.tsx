import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Camera, QrCode, AlertCircle, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

export const ScanQR: React.FC = () => {
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualZone, setManualZone] = useState("");
  const navigate = useNavigate();

  const handleScan = (data: any) => {
    if (data) {
      // Handle different structures react-qr-scanner might return (object, string, etc.)
      const scannedValue = typeof data === "object" ? data.text || data.rawValue || "" : data;
      
      if (!scannedValue) return;

      console.log("Scanned QR content:", scannedValue);
      
      try {
        // Check if scanned value is a full URL or just a zone ID
        let zone = scannedValue;
        if (scannedValue.includes("?")) {
          const urlParams = new URLSearchParams(scannedValue.split("?")[1]);
          const zoneParam = urlParams.get("zone");
          if (zoneParam) {
            zone = zoneParam;
          }
        } else if (scannedValue.includes("/report/")) {
          // Fallback parsing for URL paths
          const parts = scannedValue.split("/");
          zone = parts[parts.length - 1];
        }

        toast.success(`QR Code Scanned: Zone ${zone}`);
        navigate(`/report?zone=${encodeURIComponent(zone)}`);
      } catch (err) {
        toast.error("Failed to parse QR code content");
      }
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scanner Error:", err);
    let errorMessage = "Could not access the camera. Ensure you have granted permissions.";
    if (err && err.message) {
      errorMessage = err.message;
    }
    setScanError(errorMessage);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualZone.trim()) {
      toast.error("Please enter a valid Zone ID");
      return;
    }
    navigate(`/report?zone=${encodeURIComponent(manualZone.trim())}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 self-start text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>

      <Card className="border-slate-800 bg-slate-950 text-slate-100 shadow-xl overflow-hidden">
        <CardHeader className="text-center bg-slate-900/40 border-b border-slate-800/60 pb-6">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-indigo-500/10 p-3">
              <QrCode className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Scan Zone QR Code</CardTitle>
          <CardDescription className="text-slate-400">
            Scan the QR code on the waste bin or street pole to auto-fill the complaint location and zone.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 flex flex-col items-center justify-center">
          {!scanError ? (
            <div className="relative w-full aspect-square max-w-[320px] rounded-lg border-2 border-dashed border-indigo-500/50 overflow-hidden bg-slate-900 flex items-center justify-center">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Target bracket overlay */}
              <div className="absolute inset-8 border-2 border-indigo-400 opacity-60 rounded-md pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400 -translate-x-0.5 -translate-y-0.5"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400 translate-x-0.5 -translate-y-0.5"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400 -translate-x-0.5 translate-y-0.5"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400 translate-x-0.5 translate-y-0.5"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded text-xs text-indigo-300 animate-pulse flex items-center gap-1.5">
                <Camera className="h-3 w-3" /> Align QR code in frame
              </div>
            </div>
          ) : (
            <div className="w-full text-center py-6 px-4 bg-destructive/10 border border-destructive/20 rounded-lg text-slate-300">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="font-semibold text-destructive-foreground">Camera Access Unavailable</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {scanError}
              </p>
            </div>
          )}
        </CardContent>

        <div className="px-6 py-2 flex items-center justify-center gap-2">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Or Enter Manually</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <CardFooter className="p-6">
          <form onSubmit={handleManualSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-zone" className="text-slate-300 text-xs font-semibold">
                Zone ID / Ward Number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="manual-zone"
                  type="text"
                  placeholder="e.g. WARD-12, ZONE-A"
                  value={manualZone}
                  onChange={(e) => setManualZone(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500 flex-1"
                />
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};
