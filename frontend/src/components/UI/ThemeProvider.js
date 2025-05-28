"use client";

import React, { useContext, useEffect } from "react";
import ThemeContextProvider, { ThemeContext } from "@/store/ThemeContextProvider";

const StyleProvider = ({ children, className }) => {
  const { theme, setTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (theme !== "null") return;

    const localTheme = localStorage.getItem("theme");
    if (localTheme) {
      setTheme(localTheme);
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  return (
    <body dark-mode={theme !== "dark" ? "false" : "true"} className={className}>
      {children}
    </body>
  );
};

const ThemeProvider = ({ children, className }) => {
  return (
    <ThemeContextProvider>
      <StyleProvider className={className}>
        {children}
      </StyleProvider>
    </ThemeContextProvider>
  );
};
export default ThemeProvider;
