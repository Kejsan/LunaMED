import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
}

export const InsightCard = ({ title, value, subtitle, icon: Icon, trend }: InsightCardProps) => {
  return (
    <div className="glass-dark p-5 rounded-2xl hover:glow-accent transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full 
            ${trend === "up" ? "bg-green-500/20 text-green-400" : 
              trend === "down" ? "bg-red-500/20 text-red-400" : 
              "bg-muted text-muted-foreground"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trend}
          </span>
        )}
      </div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-2xl font-light text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground font-light mt-1">{subtitle}</p>
    </div>
  );
};
