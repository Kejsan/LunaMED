import { Globe } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  variant?: "default" | "compact";
  className?: string;
}

export const LanguageSelector = ({ variant = "default", className = "" }: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useLanguage();

  if (variant === "compact") {
    return (
      <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
        <SelectTrigger className={`w-auto gap-2 bg-background/10 border-border/30 backdrop-blur-sm ${className}`}>
          <Globe className="w-4 h-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background border-border">
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="sq">SQ</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger className={`w-full bg-muted/20 border-border/50 rounded-xl ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-background border-border">
        <SelectItem value="en">{t("english")}</SelectItem>
        <SelectItem value="sq">{t("albanian")}</SelectItem>
      </SelectContent>
    </Select>
  );
};