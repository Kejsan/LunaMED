import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { BackgroundEffects } from "./BackgroundEffects";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AppLayout = ({ children, title, subtitle }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCelestial } = useTheme();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative w-full">
          {/* Top Header */}
          <header
            className={cn(
              "sticky top-0 z-30 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b transition-colors duration-500",
              isCelestial
                ? "bg-celestial-dark/80 border-white/10"
                : "bg-white/80 border-slate-200"
            )}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                {title && (
                  <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-xs opacity-60 hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 opacity-70" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6 max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
