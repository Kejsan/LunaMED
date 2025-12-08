import { LucideIcon } from "lucide-react";

interface PhaseCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isActive?: boolean;
  daysRange: string;
}

export const PhaseCard = ({ title, description, icon: Icon, isActive, daysRange }: PhaseCardProps) => {
  return (
    <div
      className={`group relative p-6 rounded-2xl transition-all duration-500 cursor-pointer
        ${isActive 
          ? "glass-dark glow-primary scale-105" 
          : "glass-dark hover:scale-102 hover:glow-accent opacity-70 hover:opacity-100"
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isActive ? "bg-primary/20" : "bg-muted/20"} transition-colors`}>
          <Icon className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {title}
            </h3>
            <span className="text-xs text-muted-foreground font-light">{daysRange}</span>
          </div>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">{description}</p>
        </div>
      </div>
      
      {isActive && (
        <div className="absolute -left-px top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-primary to-secondary rounded-full" />
      )}
    </div>
  );
};
