import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileText, Calendar, Activity, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, subMonths } from "date-fns";

interface Profile {
  display_name: string | null;
  default_cycle_length: number | null;
  default_period_length: number | null;
}

interface Cycle {
  start_date: string;
  cycle_length: number | null;
  period_length: number | null;
}

interface DailyLog {
  log_date: string;
  flow_intensity: string | null;
  symptoms: string[] | null;
}

const Reports = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDark = theme === "celestial";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd");

    const [profileRes, cyclesRes, logsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("cycles").select("*").eq("user_id", user.id).order("start_date", { ascending: false }).limit(6),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).gte("log_date", threeMonthsAgo).order("log_date", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (cyclesRes.data) setCycles(cyclesRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    setLoading(false);
  };

  // Calculate statistics
  const avgCycleLength = cycles.length > 0
    ? Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / cycles.length)
    : profile?.default_cycle_length || 28;

  const avgPeriodLength = cycles.length > 0
    ? Math.round(cycles.reduce((sum, c) => sum + (c.period_length || 5), 0) / cycles.length)
    : profile?.default_period_length || 5;

  const regularity = cycles.length > 1
    ? Math.round(100 - (Math.max(...cycles.map(c => c.cycle_length || 28)) - Math.min(...cycles.map(c => c.cycle_length || 28))) * 5)
    : 100;

  // Get symptom list
  const symptoms: { symptom: string; date: string; intensity?: string }[] = [];
  logs.forEach((log) => {
    if (log.symptoms) {
      log.symptoms.forEach((symptom) => {
        symptoms.push({
          symptom,
          date: format(new Date(log.log_date), "MMM d"),
          intensity: log.flow_intensity || undefined,
        });
      });
    }
  });

  const handleExport = async () => {
    setGenerating(true);
    
    // Create report data
    const reportData = {
      patient: profile?.display_name || "Patient",
      generatedOn: format(new Date(), "MM/dd/yyyy"),
      reportId: `#${Math.random().toString(36).substr(2, 4).toUpperCase()}-LUNA`,
      avgCycleLength,
      avgPeriodLength,
      regularity,
      cycles: cycles.slice(0, 3).map(c => ({
        startDate: format(new Date(c.start_date), "MMM d, yyyy"),
        length: c.cycle_length || 28,
      })),
      symptoms: symptoms.slice(0, 10),
    };

    // Create downloadable JSON (in production, this would be a PDF)
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lunamed-report-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setGenerating(false);
    toast({
      title: "Report Generated",
      description: "Your health report has been downloaded.",
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Preparing report...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medical Report Builder</h1>
            <p className="text-muted-foreground">Generate reports for your healthcare provider</p>
          </div>
          <Button onClick={handleExport} disabled={generating} className="gap-2">
            <Download className="w-4 h-4" />
            {generating ? "Generating..." : "Export Report"}
          </Button>
        </div>

        {/* Report Preview */}
        <div className={`p-8 rounded-2xl ${isDark ? 'bg-card' : 'bg-white'} shadow-lg`}>
          {/* Report Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">LunaMed</h2>
                <p className="text-sm text-muted-foreground">Gynecological Health Summary</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-semibold">{profile?.display_name || "Patient"}</p>
            </div>
          </div>

          {/* Report Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span>Generated on {format(new Date(), "MM/dd/yyyy")}</span>
            <span>•</span>
            <span>ID: #{Math.random().toString(36).substr(2, 4).toUpperCase()}-LUNA</span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={<Calendar className="w-5 h-5" />}
              label="Avg Cycle Length"
              value={`${avgCycleLength} Days`}
              isDark={isDark}
            />
            <MetricCard
              icon={<Droplets className="w-5 h-5" />}
              label="Period Duration"
              value={`${avgPeriodLength} Days`}
              isDark={isDark}
            />
            <MetricCard
              icon={<Activity className="w-5 h-5" />}
              label="Regularity"
              value={`${regularity}%`}
              isDark={isDark}
            />
            <MetricCard
              icon={<FileText className="w-5 h-5" />}
              label="Cycles Tracked"
              value={`${cycles.length}`}
              isDark={isDark}
            />
          </div>

          {/* Last 3 Cycles */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Last 3 Cycles</h3>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-muted/30' : 'bg-muted/50'}`}>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full flex">
                    <div className="bg-red-500 w-[18%]" title="Day 1-5: Menstrual" />
                    <div className="bg-green-500 w-[32%]" title="Day 6-14: Follicular" />
                    <div className="bg-yellow-500 w-[7%]" title="Day 14: Ovulation" />
                    <div className="bg-purple-500 w-[43%]" title="Day 15-28: Luteal" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Day 1</span>
                <span>Day 14 (Ovulation)</span>
                <span>Day 28</span>
              </div>
            </div>
            
            {cycles.length > 0 && (
              <div className="mt-4 space-y-2">
                {cycles.slice(0, 3).map((cycle, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Cycle {i + 1}: {format(new Date(cycle.start_date), "MMM d, yyyy")}
                    </span>
                    <span>{cycle.cycle_length || 28} days</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reported Symptoms */}
          <div>
            <h3 className="font-semibold mb-4">Reported Symptoms</h3>
            {symptoms.length > 0 ? (
              <div className="space-y-2">
                {symptoms.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{item.symptom}</span>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No symptoms logged in the last 3 months.</p>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              This report is generated by LunaMed for informational purposes. 
              Please consult with your healthcare provider for medical advice.
            </p>
          </div>
        </div>

        {/* Export Options */}
        <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
          <h3 className="font-semibold mb-4">Export Options</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start gap-2" onClick={handleExport}>
              <FileText className="w-4 h-4" />
              Full Report (JSON)
            </Button>
            <Button variant="outline" className="justify-start gap-2" disabled>
              <Calendar className="w-4 h-4" />
              Calendar Export (Coming Soon)
            </Button>
            <Button variant="outline" className="justify-start gap-2" disabled>
              <Activity className="w-4 h-4" />
              Raw Data (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isDark: boolean;
}

const MetricCard = ({ icon, label, value, isDark }: MetricCardProps) => (
  <div className={`p-4 rounded-xl ${isDark ? 'bg-muted/30' : 'bg-muted/50'} text-center`}>
    <div className="flex justify-center mb-2 text-primary">{icon}</div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default Reports;