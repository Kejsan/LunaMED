import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, TrendingUp, AlertTriangle, Moon, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, differenceInDays, subMonths } from "date-fns";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Cycle {
  start_date: string;
  cycle_length: number | null;
}

interface DailyLog {
  log_date: string;
  moods: string[] | null;
  symptoms: string[] | null;
}

const Analytics = () => {
  const { user } = useAuth();
  const { isCelestial } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isDark = isCelestial;

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"3M" | "6M" | "1Y">("3M");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, timeRange]);

  const fetchData = async () => {
    if (!user) return;

    const months = timeRange === "3M" ? 3 : timeRange === "6M" ? 6 : 12;
    const startDate = format(subMonths(new Date(), months), "yyyy-MM-dd");

    const [cyclesRes, logsRes] = await Promise.all([
      supabase.from("cycles").select("*").eq("user_id", user.id).gte("start_date", startDate).order("start_date"),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).gte("log_date", startDate).order("log_date"),
    ]);

    if (cyclesRes.data) setCycles(cyclesRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    setLoading(false);
  };

  // Calculate statistics
  const avgCycleLength = cycles.length > 0
    ? Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / cycles.length)
    : 28;

  const cycleVariation = cycles.length > 1
    ? Math.max(...cycles.map(c => c.cycle_length || 28)) - Math.min(...cycles.map(c => c.cycle_length || 28))
    : 0;

  const hasIrregularity = cycleVariation > 4;

  // Get latest cycle info
  const latestCycle = cycles[cycles.length - 1];
  const cycleDay = latestCycle
    ? differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1
    : 14;

  const getPhase = () => {
    if (cycleDay <= 5) return { name: t("menstrual"), emoji: "🩸" };
    if (cycleDay <= 13) return { name: t("follicular"), emoji: "🌱" };
    if (cycleDay <= 16) return { name: t("ovulation"), emoji: "✨" };
    return { name: t("luteal"), emoji: "🌙" };
  };
  const phase = getPhase();

  // Symptom correlations
  const symptomCounts: Record<string, number[]> = {};
  logs.forEach((log) => {
    if (!log.symptoms) return;
    const dayInCycle = latestCycle
      ? differenceInDays(new Date(log.log_date), new Date(latestCycle.start_date)) + 1
      : 14;
    
    log.symptoms.forEach((symptom) => {
      if (!symptomCounts[symptom]) symptomCounts[symptom] = [];
      symptomCounts[symptom].push(dayInCycle);
    });
  });

  const topCorrelations = Object.entries(symptomCounts)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([symptom, days]) => {
      const avgDay = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
      const phaseName = avgDay <= 5 ? t("menstrual") : avgDay <= 13 ? t("follicular") : avgDay <= 16 ? t("ovulation") : t("luteal");
      return { symptom, count: days.length, phase: phaseName };
    });

  // Mood distribution
  const moodCounts: Record<string, number> = {};
  logs.forEach((log) => {
    if (!log.moods) return;
    log.moods.forEach((mood) => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
  });

  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Chart data
  const chartData = cycles.map((cycle, i) => ({
    name: format(new Date(cycle.start_date), "MMM"),
    length: cycle.cycle_length || 28,
  }));

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("cycleAnalytics")}</h1>
            <p className="text-muted-foreground">{t("deepDiveAnalytics")}</p>
          </div>
          <Button className="gap-2" asChild>
            <Link to="/reports">
              <FileText className="w-4 h-4" />
              {t("exportReport")}
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            label={t("currentPhase")}
            value={`${t("day")} ${cycleDay}`}
            sublabel={`${phase.emoji} ${phase.name}`}
            isDark={isDark}
            live
            liveLabel={t("live")}
          />
          <StatCard
            label={t("nextPeriod")}
            value={`${Math.max(0, avgCycleLength - cycleDay)} ${t("days")}`}
            sublabel={t("predicted")}
            isDark={isDark}
          />
          <StatCard
            label={t("avgCycle")}
            value={`${avgCycleLength} ${t("days")}`}
            sublabel={t("basedOnCycles").replace("{count}", cycles.length.toString())}
            isDark={isDark}
          />
          <StatCard
            label={t("variation")}
            value={`${cycleVariation} ${t("days")}`}
            sublabel={hasIrregularity ? t("irregularityDetected") : t("withinNormalRange")}
            isDark={isDark}
            warning={hasIrregularity}
          />
        </div>

        {/* Irregularity Warning */}
        {hasIrregularity && (
          <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-50'}`}>
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{t("irregularityWarning")}</p>
              <p className="text-sm text-muted-foreground">
                {t("irregularityDesc")}
              </p>
            </div>
          </div>
        )}

        {/* Celestial Insight */}
        {isDark && (
          <div className={`p-6 rounded-2xl glass-dark`}>
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold">{t("fullMoonSync")}</h3>
                <p className="text-sm text-muted-foreground">{t("alignmentDetected")}</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              "{t("fullMoonSyncDesc")}"
            </p>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cycle Length History */}
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">{t("cycleLengthHistory")}</h3>
              <div className="flex gap-2">
                {(["3M", "6M", "1Y"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      timeRange === range ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[20, 35]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'hsl(225 43% 6%)' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="length"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t("notEnoughData")}
              </div>
            )}
          </div>

          {/* Symptom Correlations */}
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("topCorrelations")}</h3>
              <Link to="/logger" className="text-sm text-primary hover:underline">{t("viewAll")}</Link>
            </div>
            
            {topCorrelations.length > 0 ? (
              <div className="space-y-4">
                {topCorrelations.map((item) => (
                  <div key={item.symptom} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">{item.symptom}</p>
                      <p className="text-sm text-muted-foreground">{t("occursMost").replace("{phase}", item.phase)}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {item.count}x {t("logged")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                {t("startLoggingSymptoms")}
              </div>
            )}
          </div>
        </div>

        {/* Emotional Trends */}
        <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
          <h3 className="font-semibold mb-4">{t("emotionalTrends")}</h3>
          {topMoods.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topMoods.map(([mood, count]) => (
                <div key={mood} className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-3xl mb-2">
                    {mood === "happy" ? "😊" : mood === "calm" ? "😌" : mood === "anxious" ? "😰" : mood === "sad" ? "😢" : mood === "tired" ? "😴" : mood === "energetic" ? "⚡" : mood === "irritable" ? "😤" : "😐"}
                  </div>
                  <p className="font-medium capitalize">{mood}</p>
                  <p className="text-sm text-muted-foreground">{count} {t("days")}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[100px] flex items-center justify-center text-muted-foreground">
              {t("startLoggingMoods")}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  sublabel: string;
  isDark: boolean;
  live?: boolean;
  liveLabel?: string;
  warning?: boolean;
}

const StatCard = ({ label, value, sublabel, isDark, live, liveLabel, warning }: StatCardProps) => (
  <div className={`p-4 rounded-xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
    <div className="flex items-center gap-2 mb-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {live && (
        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs">{liveLabel || "LIVE"}</span>
      )}
      {warning && (
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
      )}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{sublabel}</p>
  </div>
);

export default Analytics;
