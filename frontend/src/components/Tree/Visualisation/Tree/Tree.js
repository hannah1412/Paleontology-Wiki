import React, { useRef, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import Node from "@/components/Tree/Visualisation/Tree/Node";
import Branch from "@/components/Tree/Visualisation/Tree/Branch";
import { TreeContext } from "@/store/TreeContextProvider";
import styles from "./Tree.module.css";

const Tree = () => {
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
  const { treeData, zoomFactor } = useContext(TreeContext);
  // Unpack the tree data
  const { data, svgSize } = treeData;
  const [width, height] = svgSize;
  const { links, nodes } = data;
  const treeRef = useRef();

  useEffect(() => {
    // Continuously move the tree as the arrow keys are pressed using the left and top
    // css properties.
    const moveTree = (e) => {
      const tree = treeRef.current;
      const left = parseInt(tree.style.left, 10);
      const top = parseInt(tree.style.top, 10);
      const step = 250;

      tree.classList.remove(styles.transition);

      if (e.key === "ArrowUp") {
        tree.style.top = `${top + step}px`;
      } else if (e.key === "ArrowDown") {
        tree.style.top = `${top - step}px`;
      } else if (e.key === "ArrowLeft") {
        tree.style.left = `${left + step}px`;
      } else if (e.key === "ArrowRight") {
        tree.style.left = `${left - step}px`;
      }

      tree.classList.add(styles.transition);
    };

    window.addEventListener("keydown", moveTree);
    return () => window.removeEventListener("keydown", moveTree);
  }, []);

  const dragHandler = (e) => {
    e.preventDefault();
    treeRef.current.style.cursor = "grab";
    treeRef.current.classList.remove(styles.transition);
    // Get the starting position of the mouse
    let moXStart = e.pageX;
    let moYStart = e.pageY;

    // Move the tree on mouse move
    document.onmousemove = (e) => {
      e.preventDefault();
      // Calculate the change in mouse position
      let xChange = e.pageX - moXStart;
      let yChange = e.pageY - moYStart;
      let currentLeft = parseInt(treeRef.current.style.left, 10);
      let currentTop = parseInt(treeRef.current.style.top, 10);
      treeRef.current.style.left = `${currentLeft + xChange}px`;
      treeRef.current.style.top = `${currentTop + yChange}px`;
      // Update the mouse position
      moXStart = e.pageX;
      moYStart = e.pageY;
    };

    // Stop dragging when the mouse is released
    document.onmouseup = (e) => {
      e.preventDefault();
      treeRef.current.style.cursor = "default";
      if (!reduceMotion)
        treeRef.current.classList.add(styles.transition);
      document.onmouseup = null;
      document.onmousemove = null;
    };
  };

  return (
    <section
      ref={treeRef}
      className={`${styles.tree} ${!reduceMotion ? `${styles.transition} ${styles.animate} ${styles.pop}` : ""}`}
      onMouseDownCapture={dragHandler}
      style={{ transform: `scale(${zoomFactor})` }}
    >
      <svg className={styles.svg} width={width} height={height}>
        <g>
          {links.map((link, index) => {
            return <Branch key={index} link={link} />;
          })}
        </g>
      </svg>
      {nodes.map((node, index) => {
        return <Node key={index} node={node} treeRef={treeRef} />;
      })}
    </section>
  );
};
export default Tree;
