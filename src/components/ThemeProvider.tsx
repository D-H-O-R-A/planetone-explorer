
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "planetone-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Add cinematic class for global animations
    root.classList.add("cinematic-ui");
    
    // Add visual effects based on theme
    root.style.setProperty("--blur-strength", "12px");
    if (theme === "dark") {
      root.style.setProperty("--neon-glow", "0 0 20px rgba(0,224,84,0.3)");
    } else {
      root.style.setProperty("--neon-glow", "0 0 15px rgba(0,102,255,0.15)");
    }
    
    // Improve scrolling
    root.style.scrollBehavior = "smooth";
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
    
  return context;
};
