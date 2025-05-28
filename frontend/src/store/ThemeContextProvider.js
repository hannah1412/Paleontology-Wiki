import { createContext, useReducer } from "react";

export const ThemeContext = createContext({
  theme: "null",
  setTheme: () => {},
});

const themeReducer = (state, action) => {
  switch (action.type) {
    case "setTheme":
      localStorage.setItem("theme", action.payload);
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

const ThemeContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, { theme: "null" });

  const setTheme = (theme) => {
    dispatch({ type: "setTheme", payload: theme });
  };

  const ctxValue = {
    theme: state.theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={ctxValue}>{children}</ThemeContext.Provider>
  );
};
export default ThemeContextProvider;
