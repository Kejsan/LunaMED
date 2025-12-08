import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

interface DayData {
  day: number;
  type: "menstrual" | "fertile" | "ovulation" | "normal";
}

// Sample data for demonstration
const sampleDays: DayData[] = [
  { day: 1, type: "menstrual" },
  { day: 2, type: "menstrual" },
  { day: 3, type: "menstrual" },
  { day: 4, type: "menstrual" },
  { day: 5, type: "menstrual" },
  { day: 6, type: "normal" },
  { day: 7, type: "normal" },
  { day: 8, type: "normal" },
  { day: 9, type: "normal" },
  { day: 10, type: "normal" },
  { day: 11, type: "fertile" },
  { day: 12, type: "fertile" },
  { day: 13, type: "fertile" },
  { day: 14, type: "ovulation" },
  { day: 15, type: "fertile" },
  { day: 16, type: "fertile" },
  { day: 17, type: "normal" },
  { day: 18, type: "normal" },
  { day: 19, type: "normal" },
  { day: 20, type: "normal" },
  { day: 21, type: "normal" },
  { day: 22, type: "normal" },
  { day: 23, type: "normal" },
  { day: 24, type: "normal" },
  { day: 25, type: "normal" },
  { day: 26, type: "normal" },
  { day: 27, type: "normal" },
  { day: 28, type: "normal" },
  { day: 29, type: "menstrual" },
  { day: 30, type: "menstrual" },
  { day: 31, type: "menstrual" },
];

const getDayStyle = (type: DayData["type"]) => {
  switch (type) {
    case "menstrual":
      return "bg-red-500/30 text-red-200 border-red-500/50";
    case "fertile":
      return "bg-secondary/30 text-secondary border-secondary/50";
    case "ovulation":
      return "bg-gradient-to-br from-secondary to-accent text-accent-foreground border-accent";
    default:
      return "bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40";
  }
};

export const CalendarPreview = () => {
  const [currentMonth] = useState("December 2024");

  return (
    <div className="glass-dark rounded-3xl p-6 md:p-8 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button className="p-2 rounded-lg hover:bg-muted/20 transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h3 className="text-lg font-light">{currentMonth}</h3>
        <button className="p-2 rounded-lg hover:bg-muted/20 transition-colors">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-light py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for starting day offset (Sunday start) */}
        {Array.from({ length: 0 }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {sampleDays.slice(0, 31).map((dayData, i) => (
          <button
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-light border transition-all duration-200 ${getDayStyle(dayData.type)}`}
          >
            {dayData.day}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <span className="text-xs text-muted-foreground font-light">Period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary/50" />
          <span className="text-xs text-muted-foreground font-light">Fertile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-secondary to-accent" />
          <span className="text-xs text-muted-foreground font-light">Ovulation</span>
        </div>
      </div>
    </div>
  );
};
