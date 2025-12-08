import { Moon, Sun, Sparkles } from "lucide-react";

interface CycleOrbProps {
  currentDay: number;
  cycleLength: number;
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
}

const phaseColors = {
  menstrual: "from-red-500/30 to-rose-600/30",
  follicular: "from-primary/30 to-secondary/30",
  ovulation: "from-secondary/40 to-accent/40",
  luteal: "from-accent/30 to-primary/30",
};

const phaseGlows = {
  menstrual: "shadow-[0_0_80px_-20px_rgba(244,63,94,0.6)]",
  follicular: "shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)]",
  ovulation: "shadow-[0_0_80px_-20px_rgba(168,85,247,0.6)]",
  luteal: "shadow-[0_0_80px_-20px_rgba(139,92,246,0.6)]",
};

export const CycleOrb = ({ currentDay, cycleLength, phase }: CycleOrbProps) => {
  const progress = (currentDay / cycleLength) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80">
      {/* Outer glow rings */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${phaseColors[phase]} blur-3xl animate-pulse-glow`} />
      
      {/* SVG Progress Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
        {/* Background ring */}
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted/20"
        />
        {/* Progress ring */}
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Inner orb */}
      <div className={`absolute inset-8 rounded-full glass-dark flex flex-col items-center justify-center ${phaseGlows[phase]}`}>
        <Moon className="w-8 h-8 text-foreground/60 mb-2" />
        <span className="text-6xl font-extralight text-foreground">{currentDay}</span>
        <span className="text-sm font-light text-muted-foreground mt-1">Day of Cycle</span>
      </div>

      {/* Orbiting elements */}
      <div className="absolute inset-0 animate-orbit">
        <Sparkles className="w-4 h-4 text-secondary" />
      </div>
      <div className="absolute inset-0 animate-orbit" style={{ animationDelay: "-7s" }}>
        <Sun className="w-3 h-3 text-primary" />
      </div>
    </div>
  );
};
