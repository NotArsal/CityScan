import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const GenerateQR = () => {
  const [zoneId, setZoneId] = useState("WARD-12");
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const navigate = useNavigate();

  const generatedUrl = `${baseUrl}/report?zone=${encodeURIComponent(zoneId)}`;

  const handleDownload = () => {
    try {
      const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
      if (!canvas) {
        toast.error("QR Canvas element not found");
        return;
      }
      
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
        
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `cityscan-qr-${zoneId.toLowerCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success(`QR Code downloaded for Zone: ${zoneId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download QR code image");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin")}
        className="mb-4 self-start text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
      </Button>

      <Card className="border-slate-800 bg-slate-950 text-slate-100 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:100%_4px] opacity-10 pointer-events-none"></div>

        <CardHeader className="text-center bg-slate-900/40 border-b border-slate-800/60 pb-6">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-indigo-500/10 p-3">
              <QrCode className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Generate Zone QR Code</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Create tracking codes to place on street poles or waste bins. Scanning will auto-fill the citizen report forms.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="zone-id" className="text-slate-350 text-xs font-semibold uppercase tracking-wider">Zone ID / Ward Identifier</Label>
              <Input
                id="zone-id"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value.toUpperCase())}
                placeholder="e.g. WARD-12"
                className="bg-slate-905 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="base-url" className="text-slate-355 text-xs font-semibold uppercase tracking-wider">System Base URL</Label>
              <Input
                id="base-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="e.g. http://localhost:8080"
                className="bg-slate-905 border-slate-800 text-slate-100 placeholder:text-slate-750 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          <Separator className="bg-slate-800/60" />

          {/* Canvas Render Preview */}
          <div className="flex flex-col items-center justify-center space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-850">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
              <QRCodeCanvas 
                id="qr-canvas"
                value={generatedUrl} 
                size={220}
                level="H" // High error correction
                includeMargin={true}
              />
            </div>
            
            <div className="text-center space-y-1 max-w-sm">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Target Destination URL</p>
              <p className="text-xs text-indigo-400 font-mono break-all leading-normal bg-slate-900 border border-slate-850 p-2 rounded">
                {generatedUrl}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 bg-slate-900/10 border-t border-slate-800/40">
          <Button 
            onClick={handleDownload} 
            disabled={!zoneId}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Download QR Code (PNG)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GenerateQR;
