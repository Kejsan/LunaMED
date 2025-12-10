import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { format, differenceInDays } from "date-fns";

type FlowIntensity = "none" | "spot" | "light" | "medium" | "heavy";
type MoodType = "happy" | "calm" | "anxious" | "sad" | "irritable" | "energetic" | "tired" | "neutral";

const Logger = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDark = theme === "celestial";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [tab, setTab] = useState<"flow" | "physical" | "mood">("flow");
  const [loading, setSaving] = useState(false);
  
  const [logData, setLogData] = useState({
    flowIntensity: "none" as FlowIntensity,
    moods: [] as MoodType[],
    symptoms: [] as string[],
    notes: "",
    temperature: "",
    weight: "",
    sleepHours: "",
    exerciseMinutes: "",
  });

  const [cycleDay, setCycleDay] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchExistingLog();
    fetchCycleInfo();
  }, [user, currentDate]);

  const fetchCycleInfo = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cycles")
      .select("start_date")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      const days = differenceInDays(currentDate, new Date(data.start_date)) + 1;
      setCycleDay(Math.max(1, days));
    }
  };

  const fetchExistingLog = async () => {
    if (!user) return;
    const dateStr = format(currentDate, "yyyy-MM-dd");
    
    const { data } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", dateStr)
      .single();
    
    if (data) {
      setLogData({
        flowIntensity: (data.flow_intensity as FlowIntensity) || "none",
        moods: (data.moods as MoodType[]) || [],
        symptoms: data.symptoms || [],
        notes: data.notes || "",
        temperature: data.temperature?.toString() || "",
        weight: data.weight?.toString() || "",
        sleepHours: data.sleep_hours?.toString() || "",
        exerciseMinutes: data.exercise_minutes?.toString() || "",
      });
    } else {
      setLogData({
        flowIntensity: "none",
        moods: [],
        symptoms: [],
        notes: "",
        temperature: "",
        weight: "",
        sleepHours: "",
        exerciseMinutes: "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const dateStr = format(currentDate, "yyyy-MM-dd");
    
    const payload = {
      user_id: user.id,
      log_date: dateStr,
      flow_intensity: logData.flowIntensity,
      moods: logData.moods,
      symptoms: logData.symptoms,
      notes: logData.notes || null,
      temperature: logData.temperature ? parseFloat(logData.temperature) : null,
      weight: logData.weight ? parseFloat(logData.weight) : null,
      sleep_hours: logData.sleepHours ? parseFloat(logData.sleepHours) : null,
      exercise_minutes: logData.exerciseMinutes ? parseInt(logData.exerciseMinutes) : null,
    };

    const { data: existing } = await supabase
      .from("daily_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", dateStr)
      .single();

    let error;
    if (existing) {
      const result = await supabase
        .from("daily_logs")
        .update(payload)
        .eq("id", existing.id);
      error = result.error;
    } else {
      const result = await supabase.from("daily_logs").insert(payload);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save log. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Log saved!",
        description: "Your daily log has been recorded.",
      });
      navigate("/insight");
    }
  };

  const flowOptions: { value: FlowIntensity; label: string }[] = [
    { value: "none", label: "None" },
    { value: "spot", label: "Spot" },
    { value: "light", label: "Light" },
    { value: "medium", label: "Med" },
    { value: "heavy", label: "Heavy" },
  ];

  const moodOptions: { value: MoodType; emoji: string; label: string }[] = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "calm", emoji: "😌", label: "Calm" },
    { value: "energetic", emoji: "⚡", label: "Energetic" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "tired", emoji: "😴", label: "Tired" },
    { value: "anxious", emoji: "😰", label: "Anxious" },
    { value: "sad", emoji: "😢", label: "Sad" },
    { value: "irritable", emoji: "😤", label: "Irritable" },
  ];

  const symptomOptions = [
    "Cramps", "Headache", "Bloating", "Fatigue", "Breast tenderness",
    "Acne", "Back pain", "Nausea", "Insomnia", "Cravings",
  ];

  const toggleMood = (mood: MoodType) => {
    setLogData(prev => ({
      ...prev,
      moods: prev.moods.includes(mood)
        ? prev.moods.filter(m => m !== mood)
        : [...prev.moods, mood],
    }));
  };

  const toggleSymptom = (symptom: string) => {
    setLogData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getTime() - 86400000))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="font-semibold">{isToday ? "TODAY" : format(currentDate, "MMM d")}</p>
            <p className="text-sm text-muted-foreground">Cycle Day {cycleDay}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(new Date(currentDate.getTime() + 86400000))}
            disabled={isToday}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Cycle Progress */}
        <div className={`p-4 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'} text-center`}>
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-3xl mb-1">🩸</div>
              <p className="text-xs text-muted-foreground">Period</p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500" />
            <div className="text-center">
              <div className="text-3xl mb-1">✨</div>
              <p className="text-xs text-muted-foreground">Ovulation</p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500 to-purple-500" />
            <div className="text-center">
              <div className="text-3xl mb-1">🌙</div>
              <p className="text-xs text-muted-foreground">Period</p>
            </div>
          </div>
          {isDark && (
            <p className="text-sm text-muted-foreground italic">
              ♓ Energy is rising. A powerful time for manifestation and creative projects.
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "flow", label: "Flow", emoji: "🩸" },
            { id: "physical", label: "Physical", emoji: "💪" },
            { id: "mood", label: "Mood", emoji: "😊" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : isDark ? 'glass-dark' : 'glass-light'
              }`}
            >
              <span className="mr-2">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
          {tab === "flow" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Menstrual Flow</h3>
                <div className="grid grid-cols-5 gap-2">
                  {flowOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLogData({ ...logData, flowIntensity: opt.value })}
                      className={`p-4 rounded-xl text-center transition-all ${
                        logData.flowIntensity === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {opt.value === "none" ? "○" : opt.value === "spot" ? "◔" : opt.value === "light" ? "◑" : opt.value === "medium" ? "◕" : "●"}
                      </div>
                      <p className="text-xs">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        logData.symptoms.includes(symptom)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "physical" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={logData.temperature}
                    onChange={(e) => setLogData({ ...logData, temperature: e.target.value })}
                    className="w-full p-3 rounded-xl bg-muted/50 border-0 focus:ring-2 ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="130"
                    value={logData.weight}
                    onChange={(e) => setLogData({ ...logData, weight: e.target.value })}
                    className="w-full p-3 rounded-xl bg-muted/50 border-0 focus:ring-2 ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sleep (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="8"
                    value={logData.sleepHours}
                    onChange={(e) => setLogData({ ...logData, sleepHours: e.target.value })}
                    className="w-full p-3 rounded-xl bg-muted/50 border-0 focus:ring-2 ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Exercise (min)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={logData.exerciseMinutes}
                    onChange={(e) => setLogData({ ...logData, exerciseMinutes: e.target.value })}
                    className="w-full p-3 rounded-xl bg-muted/50 border-0 focus:ring-2 ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "mood" && (
            <div>
              <h3 className="font-semibold mb-4">How are you feeling?</h3>
              <div className="grid grid-cols-4 gap-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => toggleMood(mood.value)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      logData.moods.includes(mood.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <p className="text-xs">{mood.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
          <label className="text-sm font-medium mb-2 block">Private Notes</label>
          <Textarea
            placeholder="Add a private note..."
            value={logData.notes}
            onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
            className="bg-muted/50 border-0 resize-none"
            rows={3}
          />
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={loading} className="w-full gap-2" size="lg">
          {loading ? "Saving..." : "Save Log"}
          <Check className="w-4 h-4" />
        </Button>
      </div>
    </AppLayout>
  );
};

export default Logger;