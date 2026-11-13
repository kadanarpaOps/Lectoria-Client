import { useLayoutEffect, useState } from "react";

export type AppTheme = "dark" | "light";

const THEME_STORAGE_KEY = "lectoria-theme";

const getInitialTheme = (): AppTheme =>
  window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  };

  return { theme, toggleTheme };
};
