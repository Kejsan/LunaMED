import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Baby, Shield, ChevronRight, ChevronLeft, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";

type Goal = "track" | "conceive" | "avoid" | null;

const Setup = () => {
  const { user } = useAuth();
  const { isCelestial } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDark = isCelestial;

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const handleComplete = async () => {
    if (!user) {
      // User not authenticated - redirect to auth page with setup data in state
      toast({
        title: "Please sign in first",
        description: "Create an account to save your settings.",
      });
      navigate("/auth", { 
        state: { 
          returnTo: "/setup",
          setupData: { goal, cycleLength, periodLength, lastPeriodDate }
        }
      });
      return;
    }
    
    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase.from("profiles").update({
        default_cycle_length: cycleLength,
        default_period_length: periodLength,
      }).eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      // Create initial cycle if last period date provided
      if (lastPeriodDate) {
        const { error: cycleError } = await supabase.from("cycles").insert({
          user_id: user.id,
          start_date: lastPeriodDate,
          cycle_length: cycleLength,
          period_length: periodLength,
        });

        if (cycleError) {
          console.error("Cycle insert error:", cycleError);
          throw cycleError;
        }
      }

      toast({
        title: "Setup complete!",
        description: "Your cycle tracking is ready to go.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Setup error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goals = [
    {
      id: "track" as const,
      icon: <Target className="w-8 h-8" />,
      title: "Track Cycle",
      description: "Monitor symptoms, energy levels, and regularity.",
    },
    {
      id: "conceive" as const,
      icon: <Baby className="w-8 h-8" />,
      title: "Conceive",
      description: "Pinpoint ovulation and maximize fertility windows.",
    },
    {
      id: "avoid" as const,
      icon: <Shield className="w-8 h-8" />,
      title: "Avoid Pregnancy",
      description: "Identify high-risk days. (Not a replacement for contraception).",
    },
  ];

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-cosmos' : 'bg-lab'}`}>
      <BackgroundEffects />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Logo />
          <ThemeToggle />
        </div>

        {/* Progress */}
        <div className="px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                    <span className="text-3xl">1</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">What is your goal?</h1>
                  <p className="text-muted-foreground">
                    We adapt our predictions based on whether you want to track, avoid, or conceive.
                  </p>
                </div>

                <div className="space-y-4">
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`w-full p-6 rounded-2xl text-left transition-all flex items-center gap-4 ${
                        goal === g.id
                          ? 'bg-primary/20 border-2 border-primary'
                          : isDark
                          ? 'glass-dark hover:bg-muted/30'
                          : 'glass-light hover:bg-muted/50'
                      }`}
                    >
                      <div className={`text-primary ${goal === g.id ? 'scale-110' : ''} transition-transform`}>
                        {g.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{g.title}</h3>
                        <p className="text-muted-foreground text-sm">{g.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                    <span className="text-3xl">2</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Your cycle details</h1>
                  <p className="text-muted-foreground">
                    Help us understand your rhythm for accurate predictions.
                  </p>
                </div>

                <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'} space-y-6`}>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Average Cycle Length (days)</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCycleLength(Math.max(21, cycleLength - 1))}
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-4xl font-bold">{cycleLength}</span>
                        <span className="text-muted-foreground ml-2">days</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCycleLength(Math.min(45, cycleLength + 1))}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Average is 28 days</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Average Period Length (days)</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPeriodLength(Math.max(2, periodLength - 1))}
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-4xl font-bold">{periodLength}</span>
                        <span className="text-muted-foreground ml-2">days</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPeriodLength(Math.min(10, periodLength + 1))}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Average is 5 days</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                    <span className="text-3xl">3</span>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">When did your last period start?</h1>
                  <p className="text-muted-foreground">
                    This helps us calculate where you are in your cycle.
                  </p>
                </div>

                <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
                  <Input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="text-center text-lg h-14"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Don't remember? You can skip this and add it later.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !goal}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading} className="gap-2">
                  {loading ? "Saving..." : "Complete Setup"}
                  <Sparkles className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6">
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'glass-dark' : 'glass-light'} flex items-start gap-3`}>
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Encrypted Locally</p>
                <p className="text-xs text-muted-foreground">Your intimate health data is stored directly on your device.</p>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'glass-dark' : 'glass-light'} flex items-start gap-3`}>
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Cosmic Calibration</p>
                <p className="text-xs text-muted-foreground">Toggle between "Science" and "Celestial" modes anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;