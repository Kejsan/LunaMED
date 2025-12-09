import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Bell, Settings, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavLink {
  label: string;
  href: string;
}

interface AppNavbarProps {
  links?: NavLink[];
  showAuth?: boolean;
}

export const AppNavbar = ({ links, showAuth = true }: AppNavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isCelestial } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 20);
    });
  }

  const defaultLinks: NavLink[] = user
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Calendar", href: "/calendar" },
        { label: "Analytics", href: "/analytics" },
        { label: "Encyclopedia", href: "/encyclopedia" },
      ]
    : [
        { label: "Features", href: "#features" },
        { label: "Science", href: "#science" },
        { label: "Privacy", href: "#privacy" },
      ];

  const navLinks = links || defaultLinks;

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300 border-b",
        scrolled ? "py-3 backdrop-blur-md shadow-lg" : "py-6 bg-transparent",
        isCelestial ? "border-white/10" : "border-slate-200",
        scrolled && (isCelestial ? "bg-celestial-dark/80" : "bg-white/80")
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Logo />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-wide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "transition-opacity hover:opacity-100",
                location.pathname === link.href
                  ? "opacity-100 font-bold border-b-2 border-current pb-1"
                  : "opacity-70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {showAuth && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 opacity-70" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/reports" className="cursor-pointer">
                          Medical Reports
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className={cn(
                    "px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300",
                    isCelestial
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-purple-900/50"
                      : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-200"
                  )}
                >
                  Start Tracking
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden z-50"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-40 flex items-center justify-center backdrop-blur-xl md:hidden">
          <div className="flex flex-col items-center gap-8 text-xl font-light">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            {!user && (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-2 border rounded-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
