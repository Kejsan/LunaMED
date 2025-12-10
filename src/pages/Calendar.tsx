import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, differenceInDays, addMonths, subMonths, isSameDay } from "date-fns";

interface Cycle {
  start_date: string;
  cycle_length: number | null;
  period_length: number | null;
}

interface DailyLog {
  log_date: string;
  flow_intensity: string | null;
}

const Calendar = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "celestial";

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cycleDay, setCycleDay] = useState(1);
  const [currentPhase, setCurrentPhase] = useState("Follicular");
  const [daysUntilPeriod, setDaysUntilPeriod] = useState(14);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, currentMonth]);

  const fetchData = async () => {
    if (!user) return;

    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const [cyclesRes, logsRes, profileRes] = await Promise.all([
      supabase.from("cycles").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      supabase.from("daily_logs").select("log_date, flow_intensity").eq("user_id", user.id).gte("log_date", start).lte("log_date", end),
      supabase.from("profiles").select("default_cycle_length, default_period_length").eq("id", user.id).single(),
    ]);

    if (cyclesRes.data) setCycles(cyclesRes.data);
    if (logsRes.data) setLogs(logsRes.data);

    // Calculate current cycle info
    if (cyclesRes.data && cyclesRes.data.length > 0) {
      const latestCycle = cyclesRes.data[0];
      const cycleLength = profileRes.data?.default_cycle_length || 28;
      const periodLength = profileRes.data?.default_period_length || 5;
      const startDate = new Date(latestCycle.start_date);
      const today = new Date();
      const day = differenceInDays(today, startDate) + 1;
      
      setCycleDay(Math.max(1, day));
      setDaysUntilPeriod(Math.max(0, cycleLength - day));
      
      if (day <= periodLength) setCurrentPhase("Menstrual");
      else if (day <= 13) setCurrentPhase("Follicular");
      else if (day <= 16) setCurrentPhase("Ovulation");
      else setCurrentPhase("Luteal");
    }
  };

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const log = logs.find(l => l.log_date === dateStr);
    
    // Check if date falls within a period
    for (const cycle of cycles) {
      const cycleStart = new Date(cycle.start_date);
      const periodLength = cycle.period_length || 5;
      const cycleLength = cycle.cycle_length || 28;
      const dayInCycle = differenceInDays(date, cycleStart) + 1;
      
      if (dayInCycle >= 1 && dayInCycle <= periodLength) {
        return { type: "period", intensity: log?.flow_intensity };
      }
      if (dayInCycle >= 12 && dayInCycle <= 16) {
        return { type: "fertile" };
      }
      if (dayInCycle === 14) {
        return { type: "ovulation" };
      }
    }
    
    // Check for predicted period
    if (cycles.length > 0) {
      const latestCycle = cycles[0];
      const cycleLength = latestCycle.cycle_length || 28;
      const periodLength = latestCycle.period_length || 5;
      const startDate = new Date(latestCycle.start_date);
      const dayInCycle = differenceInDays(date, startDate) + 1;
      
      // Next predicted period
      if (dayInCycle > cycleLength && dayInCycle <= cycleLength + periodLength) {
        return { type: "predicted" };
      }
    }
    
    return { type: log ? "logged" : "normal" };
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad start of month
  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  // Moon emoji based on day (simplified)
  const getMoonEmoji = (date: Date) => {
    const dayOfMonth = date.getDate();
    if (dayOfMonth <= 7) return "🌑";
    if (dayOfMonth <= 14) return "🌓";
    if (dayOfMonth <= 21) return "🌕";
    return "🌗";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Master Calendar</h1>
            <p className="text-muted-foreground">Track your cycle phases and predictions</p>
          </div>
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/reports">
              <FileText className="w-4 h-4" />
              Export PDF Report
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
              <p className="text-sm text-muted-foreground mb-1">Current Phase</p>
              <p className="text-xl font-bold">{currentPhase} Phase</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
              <p className="text-sm text-muted-foreground mb-1">Cycle Day</p>
              <p className="text-4xl font-bold">{cycleDay}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
              <p className="text-sm text-muted-foreground mb-1">Next Period</p>
              <p className="text-xl font-bold">{daysUntilPeriod} Days</p>
            </div>

            {/* Legend */}
            <div className={`p-4 rounded-xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
              <p className="text-sm font-medium mb-3">Visual Key</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span>Menstruation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span>Fertile Window</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span>Ovulation Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-dashed border-red-500" />
                  <span>Prediction</span>
                </div>
              </div>
            </div>

            {/* Tip */}
            {isDark && (
              <div className={`p-4 rounded-xl glass-dark`}>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    The waxing gibbous moon phase often correlates with rising energy levels and creativity.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className={`lg:col-span-3 p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {paddedDays.map((date, i) => {
                if (!date) {
                  return <div key={`pad-${i}`} className="aspect-square" />;
                }

                const dayInfo = getDayInfo(date);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isTodayDate = isToday(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square p-1 rounded-xl text-center transition-all relative
                      ${!isCurrentMonth ? 'opacity-30' : ''}
                      ${isTodayDate ? 'ring-2 ring-primary' : ''}
                      ${isSelected ? 'bg-primary/20' : ''}
                      ${dayInfo.type === 'period' ? 'bg-red-500/30' : ''}
                      ${dayInfo.type === 'fertile' ? 'bg-green-500/20' : ''}
                      ${dayInfo.type === 'ovulation' ? 'bg-yellow-500/30' : ''}
                      ${dayInfo.type === 'predicted' ? 'border-2 border-dashed border-red-500/50' : ''}
                      hover:bg-muted/50
                    `}
                  >
                    <span className="text-sm font-medium">{format(date, "d")}</span>
                    {isDark && (
                      <span className="text-xs block opacity-50">{getMoonEmoji(date)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Calendar;