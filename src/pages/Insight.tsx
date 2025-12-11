import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Moon, Sparkles, Activity, UtensilsCrossed, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, differenceInDays } from "date-fns";

interface DailyLog {
  flow_intensity: string | null;
  moods: string[] | null;
  symptoms: string[] | null;
}

const Insight = () => {
  const { user } = useAuth();
  const { isCelestial } = useTheme();
  const navigate = useNavigate();
  const isDark = isCelestial;

  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [cycleDay, setCycleDay] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const today = format(new Date(), "yyyy-MM-dd");
    
    const [logRes, cycleRes] = await Promise.all([
      supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("log_date", today).single(),
      supabase.from("cycles").select("start_date").eq("user_id", user.id).order("start_date", { ascending: false }).limit(1).single(),
    ]);

    if (logRes.data) setTodayLog(logRes.data);
    if (cycleRes.data) {
      const days = differenceInDays(new Date(), new Date(cycleRes.data.start_date)) + 1;
      setCycleDay(Math.max(1, days));
    }
    
    setLoading(false);
  };

  const getPhase = () => {
    if (cycleDay <= 5) return "Menstrual";
    if (cycleDay <= 13) return "Follicular";
    if (cycleDay <= 16) return "Ovulation";
    return "Luteal";
  };

  const phase = getPhase();

  // Moon phase calculation (simplified)
  const getMoonPhase = () => {
    const lunarCycle = 29.53;
    const knownNewMoon = new Date("2024-01-11").getTime();
    const daysSinceNew = (Date.now() - knownNewMoon) / 86400000;
    const moonAge = daysSinceNew % lunarCycle;
    
    if (moonAge < 1.84) return { name: "New Moon", emoji: "🌑", illumination: 0 };
    if (moonAge < 7.38) return { name: "Waxing Crescent", emoji: "🌒", illumination: Math.round((moonAge / 7.38) * 50) };
    if (moonAge < 11.07) return { name: "First Quarter", emoji: "🌓", illumination: 50 };
    if (moonAge < 14.77) return { name: "Waxing Gibbous", emoji: "🌔", illumination: Math.round(50 + ((moonAge - 11.07) / 3.7) * 37) };
    if (moonAge < 18.46) return { name: "Full Moon", emoji: "🌕", illumination: 100 };
    if (moonAge < 22.15) return { name: "Waning Gibbous", emoji: "🌖", illumination: Math.round(100 - ((moonAge - 18.46) / 3.69) * 37) };
    if (moonAge < 25.84) return { name: "Last Quarter", emoji: "🌗", illumination: 50 };
    return { name: "Waning Crescent", emoji: "🌘", illumination: Math.round(50 - ((moonAge - 25.84) / 3.69) * 50) };
  };

  const moonPhase = getMoonPhase();

  const recommendations = {
    movement: phase === "Menstrual" 
      ? { title: "Gentle Yoga", desc: "Restorative poses to ease tension", time: "15 min" }
      : phase === "Ovulation"
      ? { title: "High Intensity", desc: "Your energy peaks - go all out!", time: "45 min" }
      : { title: "Cat-Cow Flow", desc: "Move energy through your spine", time: "10 min" },
    nutrition: phase === "Menstrual"
      ? { title: "Iron-Rich Foods", desc: "Replenish with spinach, lentils, red meat" }
      : phase === "Luteal"
      ? { title: "Magnesium Tea", desc: "Warm cacao or herbal tea to soothe" }
      : { title: "Leafy Greens", desc: "Support hormone balance" },
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading insights...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Banner */}
        {todayLog && (
          <div className={`p-6 rounded-2xl ${isDark ? 'bg-primary/20' : 'bg-primary/10'} flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Data Logged Successfully</h2>
              <p className="text-muted-foreground">Your daily insights are ready</p>
            </div>
          </div>
        )}

        {/* Cosmic Summary */}
        <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
          <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-4">
            {isDark ? "Cosmic Summary" : "Daily Summary"}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Symptoms & Mood */}
            <div className="space-y-4">
              {todayLog?.symptoms && todayLog.symptoms.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {todayLog.symptoms.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-full bg-muted text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {todayLog?.moods && todayLog.moods.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mood</p>
                  <p className="font-medium capitalize">{todayLog.moods.join(", ")}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Cycle Info</p>
                <p className="font-medium">Cycle Day {cycleDay} • {phase} Phase</p>
              </div>
            </div>

            {/* Moon Phase */}
            {isDark && (
              <div className="text-center">
                <div className="text-6xl mb-2">{moonPhase.emoji}</div>
                <p className="font-semibold">{moonPhase.name}</p>
                <p className="text-sm text-muted-foreground">Illumination: {moonPhase.illumination}%</p>
              </div>
            )}
          </div>

          {isDark && (
            <div className="mt-6 p-4 rounded-xl bg-muted/30 border-l-4 border-primary">
              <p className="italic text-muted-foreground">
                "Energy is building. The universe aligns with your {phase.toLowerCase()} phase."
              </p>
            </div>
          )}
        </div>

        {/* Astrological Insight (Celestial Only) */}
        {isDark && todayLog?.symptoms && todayLog.symptoms.length > 0 && (
          <div className={`p-6 rounded-2xl glass-dark`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Astrological Alignment</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              You reported {todayLog.symptoms.slice(0, 2).join(" and ")}. With the moon in {moonPhase.name.toLowerCase()}, 
              your emotional body is mirroring your physical state. The "{moonPhase.name}" phase asks you to 
              {moonPhase.name.includes("Waxing") ? " refine your plans before acting" : " release what no longer serves you"}.
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="default" size="sm">Start Ritual</Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/logger">Log More Details</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Movement</h3>
            </div>
            <h4 className="text-lg font-medium mb-1">{recommendations.movement.title}</h4>
            <p className="text-muted-foreground text-sm mb-3">{recommendations.movement.desc}</p>
            <span className="text-xs text-primary">{recommendations.movement.time}</span>
          </div>

          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Nutrition</h3>
            </div>
            <h4 className="text-lg font-medium mb-1">{recommendations.nutrition.title}</h4>
            <p className="text-muted-foreground text-sm">{recommendations.nutrition.desc}</p>
          </div>
        </div>

        {/* Week Ahead */}
        <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">The Week Ahead</h3>
            </div>
            <Link to="/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
              Full Calendar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => {
              const day = cycleDay + i;
              const futurePhase = day <= 5 ? "M" : day <= 13 ? "F" : day <= 16 ? "O" : "L";
              const isToday = i === 0;
              
              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-center ${
                    isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">Day {day}</p>
                  <p className="font-bold">{futurePhase}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button asChild className="flex-1">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/logger">Log More</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Insight;