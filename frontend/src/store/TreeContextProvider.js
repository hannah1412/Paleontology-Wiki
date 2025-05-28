import { createContext, useReducer } from "react";

export const TreeContext = createContext({
  treeType: "radial",
  classification: "benton",
  radialData: null,
  treeData: null,
  path: null,
  windowRef: null,
  root: null,
  expanded: false,
  selectedNode: null,
  zoomFactor: 1,
  setTreeType: () => {},
  setClassification: () => {},
  setRadialData: () => {},
  setTreeData: () => {},
  setPath: () => {},
  setWindowRef: () => {},
  setRoot: () => {},
  setExpanded: () => {},
  setSelectedNode: () => {},
  setZoomFactor: () => {},
});

const treeReducer = (state, action) => {
  switch (action.type) {
    case "setTreeType":
      return { ...state, treeType: action.payload };
    case "setClassification":
      return { ...state, classification: action.payload };
    case "setRadialData":
      return { ...state, radialData: action.payload };
    case "setTreeData":
      return { ...state, treeData: action.payload };
    case "setPath":
      return { ...state, path: action.payload };
    case "setWindowRef":
      return { ...state, windowRef: action.payload };
    case "setRoot":
      return { ...state, root: action.payload };
    case "setExpanded":
      return { ...state, expanded: action.payload };
    case "setSelectedNode":
      return { ...state, selectedNode: action.payload };
    case "setZoomFactor":
      return { ...state, zoomFactor: action.payload };
    default:
      return state;
  }
};

const TreeContextProvider = ({ children }) => {
  const [treeState, treeDispatch] = useReducer(treeReducer, {
    treeType: "radial",
    classification: "benton",
    radialData: null,
    treeData: null,
    path: null,
    windowRef: null,
    root: null,
    expanded: false,
    selectedNode: null,
    zoomFactor: 1,
  });

  const setTreeType = (treeType) => {
    treeDispatch({ type: "setTreeType", payload: treeType });
  };

  const setClassification = (classification) => {
    treeDispatch({ type: "setClassification", payload: classification });
  };

  const setRadialData = (radialData) => {
    treeDispatch({ type: "setRadialData", payload: radialData });
  };

  const setTreeData = (treeData) => {
    treeDispatch({ type: "setTreeData", payload: treeData });
  };

  const setPath = (node) => {
    treeDispatch({ type: "setPath", payload: node.ancestors() });
  };

  const setWindowRef = (windowRef) => {
    treeDispatch({ type: "setWindowRef", payload: windowRef });
  };

  const setRoot = (root) => {
    treeDispatch({ type: "setRoot", payload: root });
  };

  const setExpanded = (expanded) => {
    treeDispatch({ type: "setExpanded", payload: expanded });
  };

  const setSelectedNode = (node) => {
    treeDispatch({ type: "setSelectedNode", payload: node });
  };

  const setZoomFactor = (zoomFactor) => {
    treeDispatch({ type: "setZoomFactor", payload: zoomFactor });
  };

  const ctxValue = {
    treeType: treeState.treeType,
    classification: treeState.classification,
    radialData: treeState.radialData,
    treeData: treeState.treeData,
    path: treeState.path,
    windowRef: treeState.windowRef,
    root: treeState.root,
    expanded: treeState.expanded,
    selectedNode: treeState.selectedNode,
    zoomFactor: treeState.zoomFactor,
    setTreeType,
    setClassification,
    setRadialData,
    setTreeData,
    setPath,
    setWindowRef,
    setRoot,
    setExpanded,
    setSelectedNode,
    setZoomFactor,
  };

  return (
    <TreeContext.Provider value={ctxValue}>{children}</TreeContext.Provider>
  );
};
export default TreeContextProvider;
