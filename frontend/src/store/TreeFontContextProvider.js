import { createContext, useReducer } from "react";

export const SIZE_LINE_DIVIDER = 10;
export const CHAR_LINE_SPACE_DIVIDER = 100;
export const DEFAULT_FONT_SIZE = 1.2;
export const DEFAULT_CHAR_SPACE_SIZE = 0.05;
export const DEFAULT_INTER_WORD_SPACE_SIZE = 0.175;
export const DEFAULT_LINE_SPACE_SIZE = 1.5;

// Start of code adapted from code created by Group 22
const fontStyles = (fontSize, charSpacing, interWordSpacing, lineSpacing) => {
  return {
    fontSize: `${fontSize}em`,
    letterSpacing: `${charSpacing}em`,
    wordSpacing: `${interWordSpacing}em`,
    lineHeight: `${lineSpacing}em`,
  };
};
export { fontStyles };
// End of code adapted from code created by Group 22

export const TreeFontContext = createContext({
  filterOn: true,
  sizeLineDivider: SIZE_LINE_DIVIDER,
  charLineSpaceDivider: CHAR_LINE_SPACE_DIVIDER,
  fontSize: DEFAULT_FONT_SIZE,
  charSpaceSize: DEFAULT_CHAR_SPACE_SIZE,
  interWordSpaceSize: DEFAULT_INTER_WORD_SPACE_SIZE,
  lineSpaceSize: DEFAULT_LINE_SPACE_SIZE,
  setFilterOn: () => {},
  setSizeLineDivider: () => {},
  setCharLineSpaceDivider: () => {},
  setFontSize: () => {},
  setCharSpaceSize: () => {},
  setInterWordSpaceSize: () => {},
  setLineSpaceSize: () => {},
});

const treeFontReducer = (state, action) => {
  switch (action.type) {
    case "setFilterOn":
      return { ...state, filterOn: action.payload };
    case "setSizeLineDivider":
      return { ...state, sizeLineDivider: action.payload };
    case "setCharLineSpaceDivider":
      return { ...state, charLineSpaceDivider: action.payload };
    case "setFontSize":
      return { ...state, fontSize: action.payload };
    case "setCharSpaceSize":
      return { ...state, charSpaceSize: action.payload };
    case "setInterWordSpaceSize":
      return { ...state, interWordSpaceSize: action.payload };
    case "setLineSpaceSize":
      return { ...state, lineSpaceSize: action.payload };
    default:
      return state;
  }
};

const TreeFontContextProvider = ({ children }) => {
  const [fontState, dispatchFont] = useReducer(treeFontReducer, {
    filterOn: true,
    sizeLineDivider: SIZE_LINE_DIVIDER,
    charLineSpaceDivider: CHAR_LINE_SPACE_DIVIDER,
    fontSize: DEFAULT_FONT_SIZE,
    charSpaceSize: DEFAULT_CHAR_SPACE_SIZE,
    interWordSpaceSize: DEFAULT_INTER_WORD_SPACE_SIZE,
    lineSpaceSize: DEFAULT_LINE_SPACE_SIZE,
  });

  const setFilterOn = (filterOn) => {
    dispatchFont({ type: "setFilterOn", payload: filterOn });
  };

  const setSizeLineDivider = (sizeLineDivider) => {
    dispatchFont({ type: "setSizeLineDivider", payload: sizeLineDivider });
  };

  const setCharLineSpaceDivider = (charLineSpaceDivider) => {
    dispatchFont({
      type: "setCharLineSpaceDivider",
      payload: charLineSpaceDivider,
    });
  };

  const setFontSize = (fontSize) => {
    dispatchFont({ type: "setFontSize", payload: fontSize });
  };

  const setCharSpaceSize = (charSpaceSize) => {
    dispatchFont({ type: "setCharSpaceSize", payload: charSpaceSize });
  };

  const setInterWordSpaceSize = (interWordSpaceSize) => {
    dispatchFont({
      type: "setInterWordSpaceSize",
      payload: interWordSpaceSize,
    });
  };

  const setLineSpaceSize = (lineSpaceSize) => {
    dispatchFont({ type: "setLineSpaceSize", payload: lineSpaceSize });
  };

  const ctx = {
    filterOn: fontState.filterOn,
    sizeLineDivider: fontState.sizeLineDivider,
    charLineSpaceDivider: fontState.charLineSpaceDivider,
    fontSize: fontState.fontSize,
    charSpaceSize: fontState.charSpaceSize,
    interWordSpaceSize: fontState.interWordSpaceSize,
    lineSpaceSize: fontState.lineSpaceSize,
    setFilterOn,
    setSizeLineDivider,
    setCharLineSpaceDivider,
    setFontSize,
    setCharSpaceSize,
    setInterWordSpaceSize,
    setLineSpaceSize,
  };

  return (
    <TreeFontContext.Provider value={ctx}>{children}</TreeFontContext.Provider>
  );
};
export default TreeFontContextProvider;
