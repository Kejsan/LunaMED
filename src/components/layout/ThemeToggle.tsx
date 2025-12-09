import { Moon, FlaskConical } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle = ({ className, showLabel = true }: ThemeToggleProps) => {
  const { mode, toggleMode, isCelestial } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 text-xs font-bold uppercase tracking-widest",
        isCelestial
          ? "border-purple-500/50 hover:bg-purple-900/30 text-purple-200"
          : "border-teal-500/50 hover:bg-teal-50 text-teal-700",
        className
      )}
    >
      {showLabel && (
        <span>{mode === "celestial" ? "ASTRO MODE" : "CLINIC MODE"}</span>
      )}
      {isCelestial ? (
        <Moon className="w-4 h-4" />
      ) : (
        <FlaskConical className="w-4 h-4" />
      )}
    </button>
  );
};
