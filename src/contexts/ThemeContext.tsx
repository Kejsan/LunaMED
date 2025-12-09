import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeMode = "celestial" | "science";

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  isCelestial: boolean;
  isScience: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("lunamed-theme");
    return (stored as ThemeMode) || "celestial";
  });

  useEffect(() => {
    localStorage.setItem("lunamed-theme", mode);
    if (mode === "celestial") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "celestial" ? "science" : "celestial"));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        isCelestial: mode === "celestial",
        isScience: mode === "science",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
