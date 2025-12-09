import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export const BackgroundEffects = () => {
  const { isCelestial } = useTheme();

  return (
    <>
      {/* Celestial Background */}
      <div
        className={cn(
          "fixed inset-0 z-0 transition-opacity duration-700 pointer-events-none",
          isCelestial ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-cosmos" />
        <div className="stars" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Science Background */}
      <div
        className={cn(
          "fixed inset-0 z-0 transition-opacity duration-700 pointer-events-none",
          !isCelestial ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-lab" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-50/50 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50/80 rounded-full blur-[100px]" />
      </div>
    </>
  );
};

// Stars CSS effect - add to index.css
export const StarsStyle = `
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: 
    radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.15;
  z-index: 0;
}
`;
