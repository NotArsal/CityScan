import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-primary/20 bg-gradient-to-r from-primary/5 to-gov-blue/5 md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-3">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Install CityScan</h3>
              <p className="text-xs text-muted-foreground">
                Add to your home screen for faster access and offline reporting
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex space-x-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-primary to-gov-blue-light"
          >
            <Download className="mr-2 h-4 w-4" />
            Install
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;