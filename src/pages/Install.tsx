import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Share, MoreVertical, PlusSquare, Check, Moon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { isCelestial } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className={`min-h-screen ${isCelestial ? "bg-cosmos" : "bg-lab"}`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Moon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Install LunaMed</h1>
              <p className="text-muted-foreground text-sm">Add to your home screen</p>
            </div>
          </div>
        </div>

        {/* Already Installed */}
        {isInstalled && (
          <Card className="mb-6 border-green-500/50 bg-green-500/10">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-green-500">Already Installed!</h3>
                <p className="text-sm text-muted-foreground">
                  LunaMed is installed on your device. Open it from your home screen.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Install Button (for supported browsers) */}
        {deferredPrompt && !isInstalled && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <Button
                onClick={handleInstallClick}
                size="lg"
                className="w-full gap-2"
              >
                <Download className="h-5 w-5" />
                Install LunaMed Now
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                One-tap installation available
              </p>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {(isIOS || !isAndroid) && !isInstalled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Install on iPhone / iPad
              </CardTitle>
              <CardDescription>
                Follow these steps to add LunaMed to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the <Share className="h-4 w-4 inline mx-1" /> icon at the bottom of Safari
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the <PlusSquare className="h-4 w-4 inline mx-1" /> icon in the share menu
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tap "Add" to confirm</p>
                  <p className="text-sm text-muted-foreground">
                    LunaMed will appear on your home screen like a native app
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions */}
        {(isAndroid || !isIOS) && !isInstalled && !deferredPrompt && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Install on Android
              </CardTitle>
              <CardDescription>
                Follow these steps to add LunaMed to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tap the menu button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for <MoreVertical className="h-4 w-4 inline mx-1" /> in the top-right of Chrome
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tap "Install app" or "Add to Home screen"</p>
                  <p className="text-sm text-muted-foreground">
                    You may see a banner at the bottom instead
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Confirm installation</p>
                  <p className="text-sm text-muted-foreground">
                    LunaMed will be added to your app drawer and home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Install LunaMed?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500 shrink-0" />
              <span>Quick access from your home screen</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500 shrink-0" />
              <span>Works offline with cached data</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500 shrink-0" />
              <span>Full-screen experience without browser UI</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500 shrink-0" />
              <span>Faster loading times</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500 shrink-0" />
              <span>No app store required</span>
            </div>
          </CardContent>
        </Card>

        {/* Back to app */}
        <div className="mt-8 text-center">
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              Continue to App
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Install;
