import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link to="/" className={cn("flex items-center gap-2 group", className)}>
      <div className={cn("relative transition-transform duration-500 group-hover:rotate-180", sizeClasses[size])}>
        <div className="absolute inset-0 rounded-full border-2 border-current opacity-30" />
        <div className="absolute inset-1 rounded-full border border-current opacity-60" />
        <div className="absolute inset-[10px] bg-current rounded-full" />
      </div>
      <span className={cn("font-bold tracking-tight", textSizes[size])}>
        Luna<span className="font-light opacity-80">Med</span>
      </span>
    </Link>
  );
};
