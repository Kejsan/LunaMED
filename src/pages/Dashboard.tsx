import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, addDays } from "date-fns";
import { 
  Moon, LogOut, Settings, Calendar, Plus, Droplet, 
  Heart, Sparkles, TrendingUp, Brain, Activity, Download, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CycleOrb } from "@/components/CycleOrb";
import { InsightCard } from "@/components/InsightCard";
import { DailyLogModal } from "@/components/DailyLogModal";
import { SettingsModal } from "@/components/SettingsModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Cycle = Tables<"cycles">;
type DailyLog = Tables<"daily_logs">;
type Profile = Tables<"profiles">;
type UserSettings = Tables<"user_settings">;

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(profileData);

    // Fetch settings
    const { data: settingsData } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setSettings(settingsData);

    // Fetch cycles
    const { data: cyclesData } = await supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });
    setCycles(cyclesData || []);

    // Fetch today's log
    const today = format(new Date(), "yyyy-MM-dd");
    const { data: logData } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle();
    setTodayLog(logData);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [profileRes, cyclesRes, logsRes, settingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id),
        supabase.from("cycles").select("*").eq("user_id", user.id),
        supabase.from("daily_logs").select("*").eq("user_id", user.id),
        supabase.from("user_settings").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profileRes.data,
        cycles: cyclesRes.data,
        dailyLogs: logsRes.data,
        settings: settingsRes.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lunamed-data-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone."
    );

    if (!confirmed) return;

    try {
      // Delete all user data (cascades will handle related tables)
      await supabase.from("profiles").delete().eq("id", user.id);
      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: "There was an error deleting your account.",
      });
    }
  };

  // Calculate cycle info
  const latestCycle = cycles[0];
  const cycleLength = profile?.default_cycle_length || 28;
  
  let currentDay = 1;
  let currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal" = "follicular";
  let nextPeriod = "";
  let daysUntilPeriod = 0;

  if (latestCycle) {
    const startDate = new Date(latestCycle.start_date);
    currentDay = differenceInDays(new Date(), startDate) + 1;
    
    if (currentDay <= 5) currentPhase = "menstrual";
    else if (currentDay <= 13) currentPhase = "follicular";
    else if (currentDay <= 16) currentPhase = "ovulation";
    else currentPhase = "luteal";

    const nextPeriodDate = addDays(startDate, cycleLength);
    nextPeriod = format(nextPeriodDate, "MMM d");
    daysUntilPeriod = differenceInDays(nextPeriodDate, new Date());
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmos flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmos">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Moon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-light tracking-wide">
                Luna<span className="font-semibold">Med</span>
              </span>
            </a>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-light hidden sm:block">
                {profile?.display_name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-xl"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="rounded-xl"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="flex justify-center order-2 lg:order-1">
            <CycleOrb 
              currentDay={Math.min(currentDay, cycleLength)} 
              cycleLength={cycleLength} 
              phase={currentPhase} 
            />
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extralight mb-2">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
                <span className="text-gradient-celestial font-normal block mt-1">
                  {profile?.display_name || "there"}
                </span>
              </h1>
              <p className="text-muted-foreground font-light">
                {currentPhase === "menstrual" && "Take it easy today. Your body is working hard."}
                {currentPhase === "follicular" && "Energy is rising. Great time for new beginnings!"}
                {currentPhase === "ovulation" && "You're at your peak. Confidence is radiating!"}
                {currentPhase === "luteal" && "Time to wind down and practice self-care."}
              </p>
            </div>

            <Button
              onClick={() => setIsLogModalOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl h-12 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              {todayLog ? "Update Today's Log" : "Log Today"}
            </Button>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <InsightCard
                title="Cycle Day"
                value={`Day ${Math.min(currentDay, cycleLength)}`}
                subtitle={currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
                icon={Calendar}
              />
              <InsightCard
                title="Next Period"
                value={daysUntilPeriod > 0 ? `${daysUntilPeriod} days` : "Today"}
                subtitle={nextPeriod || "Not set"}
                icon={TrendingUp}
              />
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-extralight mb-6">
            Your <span className="text-gradient-celestial font-normal">Insights</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="Cycle Length"
              value={`${cycleLength} days`}
              subtitle="Your average"
              icon={Calendar}
              trend="stable"
            />
            <InsightCard
              title="Cycles Logged"
              value={cycles.length.toString()}
              subtitle="Total tracked"
              icon={Heart}
            />
            <InsightCard
              title="Today's Log"
              value={todayLog ? "Complete" : "Pending"}
              subtitle={todayLog ? "Great job!" : "Log your day"}
              icon={Droplet}
              trend={todayLog ? "up" : undefined}
            />
            <InsightCard
              title="Current Phase"
              value={currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
              subtitle={`Day ${currentDay} of ${cycleLength}`}
              icon={Sparkles}
            />
          </div>
        </section>

        {/* GDPR Section */}
        <section className="glass-dark rounded-3xl p-8">
          <h2 className="text-xl font-light mb-4">Your Data, Your Control</h2>
          <p className="text-muted-foreground font-light mb-6">
            We believe in complete transparency. You can export all your data or delete your account at any time.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="rounded-xl border-border/50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </section>
      </main>

      <DailyLogModal 
        open={isLogModalOpen} 
        onOpenChange={setIsLogModalOpen}
        existingLog={todayLog}
        onSave={fetchUserData}
      />
      
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        profile={profile}
        settings={settings}
        onSave={fetchUserData}
      />
    </div>
  );
};

export default Dashboard;
