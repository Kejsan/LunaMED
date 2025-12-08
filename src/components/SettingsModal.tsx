import { useState, useEffect } from "react";
import { Settings, User, Bell, Calendar, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type UserSettings = Tables<"user_settings">;

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  settings: UserSettings | null;
  onSave: () => void;
}

export const SettingsModal = ({ open, onOpenChange, profile, settings, onSave }: SettingsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [periodReminderDays, setPeriodReminderDays] = useState(2);
  const [ovulationReminder, setOvulationReminder] = useState(true);
  const [dataSharingConsent, setDataSharingConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCycleLength(profile.default_cycle_length || 28);
      setPeriodLength(profile.default_period_length || 5);
    }
    if (settings) {
      setNotificationsEnabled(settings.notifications_enabled ?? true);
      setPeriodReminderDays(settings.period_reminder_days || 2);
      setOvulationReminder(settings.ovulation_reminder ?? true);
      setDataSharingConsent(settings.data_sharing_consent ?? false);
    }
  }, [profile, settings, open]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          default_cycle_length: cycleLength,
          default_period_length: periodLength,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .update({
          notifications_enabled: notificationsEnabled,
          period_reminder_days: periodReminderDays,
          ovulation_reminder: ovulationReminder,
          data_sharing_consent: dataSharingConsent,
          gdpr_consent_date: dataSharingConsent ? new Date().toISOString() : null,
        })
        .eq("user_id", user.id);

      if (settingsError) throw settingsError;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
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
      <DialogContent className="glass-dark border-border/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-light flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-muted/20 rounded-xl p-1">
            <TabsTrigger value="profile" className="flex-1 rounded-lg data-[state=active]:bg-primary/20">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="cycle" className="flex-1 rounded-lg data-[state=active]:bg-primary/20">
              <Calendar className="w-4 h-4 mr-2" />
              Cycle
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1 rounded-lg data-[state=active]:bg-primary/20">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="bg-muted/20 border-border/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted/10 border-border/50 rounded-xl text-muted-foreground"
              />
            </div>
          </TabsContent>

          <TabsContent value="cycle" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Average Cycle Length (days)</Label>
              <Input
                type="number"
                min={21}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                className="bg-muted/20 border-border/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Average Period Length (days)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={periodLength}
                onChange={(e) => setPeriodLength(parseInt(e.target.value) || 5)}
                className="bg-muted/20 border-border/50 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Period Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified before your period</p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            {notificationsEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                <Label className="text-sm">Remind me (days before)</Label>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={periodReminderDays}
                  onChange={(e) => setPeriodReminderDays(parseInt(e.target.value) || 2)}
                  className="bg-muted/20 border-border/50 rounded-xl w-20"
                />
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Ovulation Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified during fertile window</p>
              </div>
              <Switch
                checked={ovulationReminder}
                onCheckedChange={setOvulationReminder}
              />
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 mt-4">
            <div className="glass-dark rounded-xl p-4 bg-primary/5">
              <h4 className="font-medium mb-2">Your Data Rights (GDPR)</h4>
              <p className="text-sm text-muted-foreground font-light">
                You have the right to access, export, and delete your data at any time. 
                Use the controls on your dashboard to manage your data.
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Analytics & Improvement</Label>
                <p className="text-xs text-muted-foreground">
                  Help improve LunaMed with anonymous usage data
                </p>
              </div>
              <Switch
                checked={dataSharingConsent}
                onCheckedChange={setDataSharingConsent}
              />
            </div>
            {dataSharingConsent && (
              <p className="text-xs text-muted-foreground pl-4 border-l-2 border-primary/30">
                Your data is anonymized and never shared with third parties.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t border-border/20 mt-4">
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
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
