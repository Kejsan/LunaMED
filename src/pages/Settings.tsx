import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Lock,
  Scale,
  Trash2,
  Download,
  Shield,
  Eye,
  Smartphone,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TabType = "profile" | "notifications" | "privacy" | "units";

const Settings = () => {
  const navigate = useNavigate();
  const { isCelestial } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("privacy");
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Settings state
  const [profile, setProfile] = useState({ displayName: "", email: "" });
  const [notifications, setNotifications] = useState({
    periodStart: true,
    periodDaysBefore: 2,
    fertileWindow: true,
    moonPhase: true,
  });
  const [units, setUnits] = useState({ temp: "celsius", weight: "kg" });
  const [dataSharing, setDataSharing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchSettings();
    }
  }, [user, loading, navigate]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: settingsData } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile({
        displayName: profileData.display_name || "",
        email: user.email || "",
      });
    }

    if (settingsData) {
      setNotifications({
        periodStart: settingsData.notifications_enabled ?? true,
        periodDaysBefore: settingsData.period_reminder_days ?? 2,
        fertileWindow: settingsData.ovulation_reminder ?? true,
        moonPhase: true,
      });
      setDataSharing(settingsData.data_sharing_consent ?? false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const { data: cycles } = await supabase
        .from("cycles")
        .select("*")
        .eq("user_id", user?.id);
      const { data: logs } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user?.id);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profileData,
        cycles,
        dailyLogs: logs,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lunamed-data-export.json";
      a.click();

      toast({ title: t("dataExported"), description: t("dataExportedDesc") });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("exportError"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast({
          title: t("error"),
          description: "Session expired. Please sign in again.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      // Sign out the user after successful deletion
      await signOut();

      toast({
        title: t("accountDeleted") || "Account Deleted",
        description:
          t("accountDeletedDesc") ||
          "Your account and all data have been permanently deleted.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast({
        title: t("error"),
        description:
          error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ display_name: profile.displayName })
        .eq("id", user.id);
      await supabase
        .from("user_settings")
        .update({
          notifications_enabled: notifications.periodStart,
          period_reminder_days: notifications.periodDaysBefore,
          ovulation_reminder: notifications.fertileWindow,
          data_sharing_consent: dataSharing,
        })
        .eq("user_id", user.id);

      toast({ title: t("success"), description: t("settingsSaved") });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("settingsError"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const tabs = [
    { id: "profile" as TabType, label: t("profileAccount"), icon: User },
    { id: "notifications" as TabType, label: t("notifications"), icon: Bell },
    { id: "privacy" as TabType, label: t("dataPrivacy"), icon: Lock },
    { id: "units" as TabType, label: t("unitsFormat"), icon: Scale },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 relative">
          <BackgroundEffects />

          <main className="relative z-10 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2 opacity-60 text-sm font-mono uppercase tracking-widest">
                    <span>{t("account")}</span>
                    <span>/</span>
                    <span>{t("configuration")}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    {t("settingsPrivacy")}
                  </h1>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <LanguageSelector variant="compact" />
                  <ThemeToggle />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Sidebar Tabs */}
                <aside className="lg:col-span-3">
                  <div className="sticky top-8 space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium group relative overflow-hidden ${
                          activeTab === tab.id
                            ? isCelestial
                              ? "bg-white/10 text-white shadow-lg border border-white/20"
                              : "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                            : "opacity-60 hover:opacity-100 hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-300 ${
                            activeTab === tab.id
                              ? isCelestial
                                ? "bg-purple-400"
                                : "bg-primary"
                              : "opacity-0"
                          }`}
                        />
                        <tab.icon
                          className={`w-5 h-5 ${activeTab === tab.id ? "opacity-100" : "opacity-70"}`}
                        />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </aside>

                {/* Content Panel */}
                <div className="lg:col-span-9 space-y-6">
                  {/* Privacy Section */}
                  {activeTab === "privacy" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div
                        className={`rounded-3xl border backdrop-blur-md p-8 ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-sm"}`}
                      >
                        <div className="flex items-start justify-between mb-8">
                          <div>
                            <h2 className="text-2xl font-bold mb-2">
                              {t("dataOwnership")}
                            </h2>
                            <p className="text-sm opacity-70 max-w-xl">
                              {t("dataOwnershipDesc")}
                            </p>
                          </div>
                          <div
                            className={`hidden sm:block p-3 rounded-full ${isCelestial ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"}`}
                          >
                            <Shield className="w-8 h-8" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Export Box */}
                          <div
                            className={`p-6 rounded-2xl border transition-all hover:bg-muted/50 ${isCelestial ? "border-white/10 bg-white/5" : "border-border bg-muted/50"}`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <Download className="w-6 h-6 opacity-70" />
                              <h3 className="font-semibold">
                                {t("exportData")}
                              </h3>
                            </div>
                            <p className="text-xs opacity-60 mb-6 h-10">
                              {t("exportDataDesc")}
                            </p>
                            <Button
                              onClick={handleExportData}
                              disabled={isExporting}
                              variant="outline"
                              className="w-full"
                            >
                              {isExporting
                                ? t("preparingReport")
                                : t("downloadJson")}
                            </Button>
                          </div>

                          {/* Delete Box */}
                          <div
                            className={`p-6 rounded-2xl border ${isCelestial ? "border-red-900/50 bg-red-900/10" : "border-red-100 bg-red-50"}`}
                          >
                            <div className="flex items-center gap-3 mb-4 text-red-500">
                              <Trash2 className="w-6 h-6" />
                              <h3 className="font-semibold">
                                {t("deleteAccount")}
                              </h3>
                            </div>
                            <p className="text-xs opacity-60 mb-6 h-10">
                              {t("deleteAccountDesc")}
                            </p>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  {t("deleteMyData")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t("areYouSure")}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("deleteWarning")}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t("cancel")}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    {t("confirmDelete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>

                      {/* Research Toggle */}
                      <div
                        className={`rounded-2xl border p-6 flex items-center justify-between backdrop-blur-md ${isCelestial ? "border-white/10 bg-white/5" : "border-border bg-card"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isCelestial ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}
                          >
                            <Eye className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">
                              {t("researchContribution")}
                            </h3>
                            <p className="text-xs opacity-60">
                              {t("researchContributionDesc")}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={dataSharing}
                          onCheckedChange={setDataSharing}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notifications Section */}
                  {activeTab === "notifications" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Push Notifications Card */}
                      <div
                        className={`rounded-3xl border backdrop-blur-md overflow-hidden ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-sm"}`}
                      >
                        <div
                          className={`p-8 border-b ${isCelestial ? "border-white/10" : "border-border"}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Smartphone className="w-5 h-5 opacity-70" />
                            <h2 className="text-2xl font-bold">
                              {t("pushNotifications") || "Push Notifications"}
                            </h2>
                          </div>
                          <p className="text-sm opacity-60 mt-1">
                            {t("pushNotificationsDesc") ||
                              "Receive reminders directly on your device"}
                          </p>
                        </div>
                        <div className="p-6">
                          <PushNotificationToggle showLabel={true} size="md" />
                        </div>
                      </div>

                      {/* Orbital Alerts Card */}
                      <div
                        className={`rounded-3xl border backdrop-blur-md overflow-hidden ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-sm"}`}
                      >
                        <div
                          className={`p-8 border-b ${isCelestial ? "border-white/10" : "border-border"}`}
                        >
                          <h2 className="text-2xl font-bold">
                            {t("orbitalAlerts")}
                          </h2>
                          <p className="text-sm opacity-60 mt-1">
                            {t("orbitalAlertsDesc")}
                          </p>
                        </div>

                        <div
                          className={`divide-y ${isCelestial ? "divide-white/5" : "divide-border"}`}
                        >
                          {/* Period Start */}
                          <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {t("periodApproaching")}
                              </div>
                              <div className="text-xs opacity-60">
                                {t("periodApproachingDesc")}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <select
                                value={notifications.periodDaysBefore}
                                onChange={(e) =>
                                  setNotifications({
                                    ...notifications,
                                    periodDaysBefore: parseInt(e.target.value),
                                  })
                                }
                                className={`text-xs rounded-lg px-3 py-2 border bg-transparent focus:ring-2 outline-none ${isCelestial ? "border-white/20 focus:ring-purple-500" : "border-border focus:ring-primary"}`}
                              >
                                <option value="1">1 {t("dayBefore")}</option>
                                <option value="2">2 {t("daysBefore")}</option>
                                <option value="3">3 {t("daysBefore")}</option>
                              </select>
                              <Switch
                                checked={notifications.periodStart}
                                onCheckedChange={(v) =>
                                  setNotifications({
                                    ...notifications,
                                    periodStart: v,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* Fertile Window */}
                          <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {t("fertilityWindow")}
                              </div>
                              <div className="text-xs opacity-60">
                                {t("fertilityWindowDesc")}
                              </div>
                            </div>
                            <Switch
                              checked={notifications.fertileWindow}
                              onCheckedChange={(v) =>
                                setNotifications({
                                  ...notifications,
                                  fertileWindow: v,
                                })
                              }
                            />
                          </div>

                          {/* Moon Phase */}
                          <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2">
                                {t("moonPhaseShifts")}
                                {!isCelestial && (
                                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">
                                    {t("optional")}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs opacity-60">
                                {t("moonPhaseShiftsDesc")}
                              </div>
                            </div>
                            <Switch
                              checked={notifications.moonPhase}
                              onCheckedChange={(v) =>
                                setNotifications({
                                  ...notifications,
                                  moonPhase: v,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Units Section */}
                  {activeTab === "units" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className={`rounded-3xl border backdrop-blur-md p-8 ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-sm"}`}>
                        <h2 className="text-2xl font-bold mb-6">{t("language")}</h2>
                        <div className="max-w-xs">
                          <LanguageSelector />
                        </div>
                      </div>
                      <div
                        className={`rounded-3xl border backdrop-blur-md p-8 ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-sm"}`}
                      >
                        <h2 className="text-2xl font-bold mb-6">
                          {t("measurementPreferences")}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Temperature */}
                          <div className="space-y-4">
                            <label className="text-sm font-semibold uppercase tracking-wider opacity-60">
                              {t("temperature")}
                            </label>
                            <div className="flex gap-4">
                              <Button
                                onClick={() =>
                                  setUnits({ ...units, temp: "celsius" })
                                }
                                variant={
                                  units.temp === "celsius"
                                    ? "default"
                                    : "outline"
                                }
                                className="flex-1"
                              >
                                Celsius (°C)
                              </Button>
                              <Button
                                onClick={() =>
                                  setUnits({ ...units, temp: "fahrenheit" })
                                }
                                variant={
                                  units.temp === "fahrenheit"
                                    ? "default"
                                    : "outline"
                                }
                                className="flex-1"
                              >
                                Fahrenheit (°F)
                              </Button>
                            </div>
                          </div>

                          {/* Weight */}
                          <div className="space-y-4">
                            <label className="text-sm font-semibold uppercase tracking-wider opacity-60">
                              {t("weight")}
                            </label>
                            <div className="flex gap-4">
                              <Button
                                onClick={() =>
                                  setUnits({ ...units, weight: "kg" })
                                }
                                variant={
                                  units.weight === "kg" ? "default" : "outline"
                                }
                                className="flex-1"
                              >
                                Kilograms (kg)
                              </Button>
                              <Button
                                onClick={() =>
                                  setUnits({ ...units, weight: "lbs" })
                                }
                                variant={
                                  units.weight === "lbs" ? "default" : "outline"
                                }
                                className="flex-1"
                              >
                                Pounds (lbs)
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profile Section */}
                  {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div
                        className={`rounded-3xl border backdrop-blur-md p-8 ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-sm"}`}
                      >
                        <h2 className="text-2xl font-bold mb-6">
                          {t("securityLogin")}
                        </h2>
                        <div className="space-y-6 max-w-lg">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                              {t("displayName")}
                            </label>
                            <Input
                              value={profile.displayName}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  displayName: e.target.value,
                                })
                              }
                              placeholder={t("displayName")}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                              {t("emailAddress")}
                            </label>
                            <Input
                              value={profile.email}
                              disabled
                              className="opacity-60"
                            />
                          </div>
                          
                          {/* Change Password Section */}
                          <div className="pt-6 border-t border-border/50">
                             <h3 className="text-sm font-semibold mb-4">{t("changePassword")}</h3>
                             <Button onClick={() => navigate("/auth?reset=true")} variant="outline" className="w-full justify-between">
                               <span>{t("requestResetEmail")}</span>
                               <Lock className="w-4 h-4 ml-2" />
                             </Button>
                          </div>

                          <div className="pt-4">
                            <Button onClick={handleUpdateSettings}>
                              {t("updateCredentials")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleUpdateSettings} size="lg">
                      {t("save")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
