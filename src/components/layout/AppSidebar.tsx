import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  FileText,
  BookOpen,
  PlusCircle,
  Settings,
} from "lucide-react";
import { Logo } from "./Logo";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: PlusCircle, label: "Log Symptoms", href: "/logger" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: BookOpen, label: "Encyclopedia", href: "/encyclopedia" },
];

export const AppSidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { isCelestial } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 border-r flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0",
        isCelestial
          ? "bg-celestial-dark/90 border-white/10 backdrop-blur-xl"
          : "bg-white/90 border-slate-200 backdrop-blur-xl"
      )}
    >
      <div className="h-full flex flex-col p-6">
        {/* Logo */}
        <div className="mb-10">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? isCelestial
                      ? "bg-white/10 text-white font-semibold"
                      : "bg-teal-50 text-teal-700 font-semibold"
                    : isCelestial
                    ? "text-white/50 hover:bg-white/5 hover:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-4",
            location.pathname === "/settings"
              ? isCelestial
                ? "bg-white/10 text-white"
                : "bg-teal-50 text-teal-700"
              : isCelestial
              ? "text-white/50 hover:bg-white/5 hover:text-white"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>

        {/* User Profile */}
        {user && (
          <div
            className={cn(
              "border-t pt-4",
              isCelestial ? "border-white/10" : "border-slate-200"
            )}
          >
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <Avatar
                className={cn(
                  "h-10 w-10 border-2",
                  isCelestial ? "border-purple-500" : "border-teal-500"
                )}
              >
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold truncate">
                  {user.user_metadata?.display_name || "User"}
                </p>
                <p className="text-xs opacity-60 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
