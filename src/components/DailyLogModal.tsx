import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Droplet, Smile, Activity, Moon, ThermometerSun, Scale, BedDouble } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Tables, Enums } from "@/integrations/supabase/types";

type DailyLog = Tables<"daily_logs">;
type FlowIntensity = Enums<"flow_intensity">;
type MoodType = Enums<"mood_type">;

interface DailyLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLog: DailyLog | null;
  onSave: () => void;
}

const flowOptions: { value: FlowIntensity; label: string; color: string }[] = [
  { value: "none", label: "None", color: "bg-muted" },
  { value: "light", label: "Light", color: "bg-red-300" },
  { value: "medium", label: "Medium", color: "bg-red-500" },
  { value: "heavy", label: "Heavy", color: "bg-red-700" },
];

const moodOptions: { value: MoodType; label: string; emoji: string }[] = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "energetic", label: "Energetic", emoji: "⚡" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "anxious", label: "Anxious", emoji: "😰" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "irritable", label: "Irritable", emoji: "😤" },
];

const symptomOptions = [
  "Cramps", "Headache", "Bloating", "Breast tenderness", 
  "Back pain", "Fatigue", "Acne", "Nausea", "Food cravings",
  "Insomnia", "Mood swings", "Spotting"
];

export const DailyLogModal = ({ open, onOpenChange, existingLog, onSave }: DailyLogModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>("none");
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setFlowIntensity(existingLog.flow_intensity || "none");
      setSelectedMoods((existingLog.moods as MoodType[]) || []);
      setSelectedSymptoms(existingLog.symptoms || []);
      setTemperature(existingLog.temperature?.toString() || "");
      setWeight(existingLog.weight?.toString() || "");
      setSleepHours(existingLog.sleep_hours?.toString() || "");
      setExerciseMinutes(existingLog.exercise_minutes?.toString() || "");
      setNotes(existingLog.notes || "");
    } else {
      resetForm();
    }
  }, [existingLog, open]);

  const resetForm = () => {
    setFlowIntensity("none");
    setSelectedMoods([]);
    setSelectedSymptoms([]);
    setTemperature("");
    setWeight("");
    setSleepHours("");
    setExerciseMinutes("");
    setNotes("");
  };

  const toggleMood = (mood: MoodType) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    const logData = {
      user_id: user.id,
      log_date: format(new Date(), "yyyy-MM-dd"),
      flow_intensity: flowIntensity,
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      temperature: temperature ? parseFloat(temperature) : null,
      weight: weight ? parseFloat(weight) : null,
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      exercise_minutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
      notes: notes || null,
    };

    try {
      if (existingLog) {
        const { error } = await supabase
          .from("daily_logs")
          .update(logData)
          .eq("id", existingLog.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_logs")
          .insert(logData);
        
        if (error) throw error;
      }

      toast({
        title: "Log saved",
        description: "Your daily log has been recorded.",
      });
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-dark border-border/20 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-light flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Log for {format(new Date(), "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Flow Intensity */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Droplet className="w-4 h-4 text-red-400" />
              Flow Intensity
            </Label>
            <div className="flex gap-2">
              {flowOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFlowIntensity(option.value)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-light transition-all ${
                    flowIntensity === option.value
                      ? "ring-2 ring-primary bg-primary/20"
                      : "bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-1`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Smile className="w-4 h-4 text-yellow-400" />
              How are you feeling?
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleMood(option.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-light transition-all ${
                    selectedMoods.includes(option.value)
                      ? "ring-2 ring-primary bg-primary/20"
                      : "bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <span className="text-lg block mb-1">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Activity className="w-4 h-4 text-secondary" />
              Symptoms
            </Label>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`py-1.5 px-3 rounded-full text-xs font-light transition-all ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <ThermometerSun className="w-3 h-3" />
                Temperature (°F)
              </Label>
              <Input
                type="number"
                step="0.1"
                placeholder="98.6"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="bg-muted/20 border-border/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Scale className="w-3 h-3" />
                Weight (lbs)
              </Label>
              <Input
                type="number"
                step="0.1"
                placeholder="150"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-muted/20 border-border/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <BedDouble className="w-3 h-3" />
                Sleep (hours)
              </Label>
              <Input
                type="number"
                step="0.5"
                placeholder="8"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="bg-muted/20 border-border/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Activity className="w-3 h-3" />
                Exercise (mins)
              </Label>
              <Input
                type="number"
                placeholder="30"
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(e.target.value)}
                className="bg-muted/20 border-border/50 rounded-xl"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea
              placeholder="How was your day? Any observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-muted/20 border-border/50 rounded-xl resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl border-border/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary"
          >
            {isLoading ? "Saving..." : "Save Log"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
