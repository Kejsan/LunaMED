import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, differenceInDays, addDays } from "date-fns";
import { 
  Calendar, Plus, TrendingUp, Zap, Thermometer, Moon, Sparkles,
  ChevronRight, Activity, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Cycle = Tables<"cycles">;
type DailyLog = Tables<"daily_logs">;
type Profile = Tables<"profiles">;

const phaseData = {
  menstrual: {
    name: "Menstrual Phase",
    description: "Your body is renewing. Rest and gentle movement are ideal.",
    celestialWisdom: "The dark moon invites introspection. Honor your body's need for rest.",
    color: "from-red-500/20 to-rose-500/20",
    borderColor: "border-red-500/30",
  },
  follicular: {
    name: "Follicular Phase", 
    description: "Rising energy and creativity. Great time for new projects.",
    celestialWisdom: "The waxing moon brings fresh energy. Set your intentions.",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
  },
  ovulation: {
    name: "Ovulatory Phase",
    description: "Peak energy and communication. Your magnetism is at its highest.",
    celestialWisdom: "The full moon illuminates your inner power. Shine bright.",
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/30",
  },
  luteal: {
    name: "Luteal Phase",
    description: "Time to wind down. Focus on completion and self-care.",
    celestialWisdom: "The waning moon calls for release. Let go of what no longer serves.",
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30",
  },
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isCelestial } = useTheme();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);

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

    const [profileRes, cyclesRes, todayLogRes, recentLogsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("cycles").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("log_date", format(new Date(), "yyyy-MM-dd")).maybeSingle(),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(7),
    ]);

    setProfile(profileRes.data);
    setCycles(cyclesRes.data || []);
    setTodayLog(todayLogRes.data);
    setRecentLogs(recentLogsRes.data || []);
  };

  // Calculate cycle info
  const latestCycle = cycles[0];
  const cycleLength = profile?.default_cycle_length || 28;
  
  let currentDay = 1;
  let currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal" = "follicular";
  let daysUntilPeriod = 0;
  let fertilityStatus = "Low";

  if (latestCycle) {
    const startDate = new Date(latestCycle.start_date);
    currentDay = differenceInDays(new Date(), startDate) + 1;
    
    if (currentDay <= 5) currentPhase = "menstrual";
    else if (currentDay <= 13) currentPhase = "follicular";
    else if (currentDay <= 16) { currentPhase = "ovulation"; fertilityStatus = "High"; }
    else currentPhase = "luteal";

    const nextPeriodDate = addDays(startDate, cycleLength);
    daysUntilPeriod = Math.max(0, differenceInDays(nextPeriodDate, new Date()));
  }

  const phase = phaseData[currentPhase];

  // Forecast data
  const forecast = [
    { day: "Tomorrow", event: "Energy Spike", detail: "Estrogen peaking" },
    { day: format(addDays(new Date(), 2), "EEE d"), event: "Mild Bloating", detail: "Ovulation effect" },
    { day: format(addDays(new Date(), 3), "EEE d"), event: "Temperature Rise", detail: "+0.5°F expected" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header with Date */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-light">
              Today: {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
        </div>

        {/* Phase Card */}
        <div className={`relative overflow-hidden rounded-3xl border p-8 ${
          isCelestial 
            ? `bg-gradient-to-br ${phase.color} ${phase.borderColor} backdrop-blur-sm` 
            : "bg-card border-border"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Current Phase</p>
              <h1 className="text-3xl md:text-4xl font-light">{phase.name}</h1>
              <p className="text-muted-foreground font-light max-w-md">
                {isCelestial ? phase.celestialWisdom : phase.description}
              </p>
            </div>

            <div className="flex items-center gap-8">
              {/* Cycle Day Circle */}
              <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 ${
                isCelestial ? phase.borderColor : "border-primary/30"
              }`}>
                <span className="text-3xl font-light">{Math.min(currentDay, cycleLength)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Day</span>
              </div>

              <Button
                onClick={() => navigate("/logger")}
                className={`h-12 px-6 rounded-xl ${
                  isCelestial 
                    ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Log Today
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-6 rounded-2xl border ${
            isCelestial ? "bg-card/50 border-border/30 backdrop-blur-sm" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-light">{daysUntilPeriod}</p>
            <p className="text-xs text-muted-foreground">Days until period</p>
          </div>

          <div className={`p-6 rounded-2xl border ${
            isCelestial ? "bg-card/50 border-border/30 backdrop-blur-sm" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-light">{fertilityStatus}</p>
            <p className="text-xs text-muted-foreground">Fertility window</p>
          </div>

          <div className={`p-6 rounded-2xl border ${
            isCelestial ? "bg-card/50 border-border/30 backdrop-blur-sm" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-light">{cycles.length}</p>
            <p className="text-xs text-muted-foreground">Cycles tracked</p>
          </div>

          <div className={`p-6 rounded-2xl border ${
            isCelestial ? "bg-card/50 border-border/30 backdrop-blur-sm" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-light">{todayLog ? "Done" : "Pending"}</p>
            <p className="text-xs text-muted-foreground">Today's log</p>
          </div>
        </div>

        {/* Predictions & Forecast */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Prediction */}
          <div className={`p-6 rounded-2xl border ${
            isCelestial ? "bg-card/50 border-border/30 backdrop-blur-sm" : "bg-card border-border"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-light text-lg">Today's Prediction</h3>
              <Link to="/insight" className="text-xs text-primary flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">High Energy Day</p>
                  <p className="text-xs text-muted-foreground">
                    {isCelestial ? "Moon energy favors action" : "Hormones support activity"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Slight Temperature Rise</p>
                  <p className="text-xs text-muted-foreground">+0.3°F from baseline expected</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Day Forecast */}
          <div className={`p-6 rounded-2xl border ${
            isCelestial ? "bg-card/50 border-border/30 backdrop-blur-sm" : "bg-card border-border"
          }`}>
            <h3 className="font-light text-lg mb-6">Forecast Next 3 Days</h3>

            <div className="space-y-3">
              {forecast.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">{item.event}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lunar Wisdom (Celestial mode only) */}
        {isCelestial && (
          <div className={`p-6 rounded-2xl border bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20`}>
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-6 h-6 text-primary" />
              <h3 className="font-light text-lg">Lunar Wisdom</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Rituals</p>
                <p className="text-sm font-light">Harnessing waxing moon energy for manifestation work</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Self Care</p>
                <p className="text-sm font-light">Crystals for the {currentPhase} phase</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/calendar" className={`p-4 rounded-xl border text-center hover:bg-muted/20 transition-colors ${
            isCelestial ? "bg-card/30 border-border/30" : "bg-card border-border"
          }`}>
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm">Calendar</span>
          </Link>
          <Link to="/analytics" className={`p-4 rounded-xl border text-center hover:bg-muted/20 transition-colors ${
            isCelestial ? "bg-card/30 border-border/30" : "bg-card border-border"
          }`}>
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <span className="text-sm">Analytics</span>
          </Link>
          <Link to="/reports" className={`p-4 rounded-xl border text-center hover:bg-muted/20 transition-colors ${
            isCelestial ? "bg-card/30 border-border/30" : "bg-card border-border"
          }`}>
            <Activity className="w-6 h-6 mx-auto mb-2 text-accent" />
            <span className="text-sm">Reports</span>
          </Link>
          <Link to="/encyclopedia" className={`p-4 rounded-xl border text-center hover:bg-muted/20 transition-colors ${
            isCelestial ? "bg-card/30 border-border/30" : "bg-card border-border"
          }`}>
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="text-sm">Learn</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;