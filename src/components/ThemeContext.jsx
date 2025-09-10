import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const COOKIE_NAME = "theme";

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [theme, setTheme] = useState(() => {
    const saved = Cookies.get(COOKIE_NAME);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
    return getSystemTheme();
  });

  useEffect(() => {
    const root = document.documentElement;

    let appliedTheme = theme;
    if (theme === "system") {
      appliedTheme = getSystemTheme();
    }

    root.setAttribute("data-theme", appliedTheme);
    Cookies.set(COOKIE_NAME, theme, { expires: 365, sameSite: "lax" });
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newTheme = mediaQuery.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}