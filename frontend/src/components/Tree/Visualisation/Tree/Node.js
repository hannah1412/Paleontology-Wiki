import React, { useRef, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import { TreeContext } from "@/store/TreeContextProvider";
import styles from "./Node.module.css";

const Node = ({ node, treeRef }) => {
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
  const { path, zoomFactor, setPath, setSelectedNode, setZoomFactor } =
    useContext(TreeContext);
  const nodeRef = useRef();

  // Determine the node position in the tree
  const selected = path.includes(node) && path.indexOf(node) === 0;
  const ancestor = path.includes(node) && path.indexOf(node) !== 0;

  // Position the node relative to the parent node so that it is in the calculated tree
  // position
  const nodeStyling = {
    translate: `calc(${node.x}px + 20rem) calc(${node.y}px + 20rem)`,
  };
  const classes = `${styles.node_button} ${!reduceMotion ? styles.motion : ""} ${selected ? styles.selected : ancestor ? "" : styles.soften}`;

  // Position the tree so that the selected node is in the center of the screen and the tree.
  const adjustTreePosition = () => {
    // Set the tree position so that the selected node is in the center of the screen and
    // the tree is zoomed in.
    const nodeRect = nodeRef.current.getBoundingClientRect();
    const nodeCenterX = nodeRect.left + window.scrollX + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + window.scrollY + nodeRect.height / 2;
    // Calculate the center of the window
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = Math.max(window.innerHeight / 1.75, 500);
    // Calculate the new position of the tree
    const newLeft = treeRef.current.offsetLeft + windowCenterX - nodeCenterX;
    const newTop = treeRef.current.offsetTop + windowCenterY - nodeCenterY;
    // Set the new position of the tree
    treeRef.current.style.left = `${newLeft}px`;
    treeRef.current.style.top = `${newTop}px`;
  };

  // When the zoom factor changes, adjust the tree position
  useEffect(() => {
    if (!selected) return;
    setTimeout(() => {
      adjustTreePosition();
    }, 350);
  }, [zoomFactor]);

  // When the path changes, adjust the tree position
  useEffect(() => {
    if (!selected) return;
    adjustTreePosition();
  }, [path]);

  // When the node is clicked, set the path and the selected node
  const nodeClickHandler = (e) => {
    e.preventDefault();
    setPath(node);
    setSelectedNode(node.data.id);
  };

  return (
    <div ref={nodeRef} style={nodeStyling} className={styles["node"]}>
      <button onClick={nodeClickHandler} className={classes}>
        {node.data.name}
      </button>
    </div>
  );
};
export default Node;
