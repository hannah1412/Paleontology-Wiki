import React, { useRef, useEffect } from "react";
import Branch from "@/components/Tree/Widget/Tree/Branch";
import Node from "@/components/Tree/Widget/Tree/Node";
import styles from "./Tree.module.css";

export default function Tree({ treeData, widgetRef, larger }) {
  // Deconstruct the tree data
  const { svgSize, data, path } = treeData;
  const [svgWidth, svgHeight] = svgSize;
  const { links, nodes } = data;
  const treeRef = useRef();

  // Drag functionality
  // When the user clicks on the tree, start dragging by moving the svg behind
  // the view box.
  const dragHandler = (e) => {
    e.preventDefault();
    // Set the cursor to grab
    treeRef.current.style.cursor = "grab";
    // Get the starting position of the mouse
    let mouseX = e.clientX;
    let mouseY = e.clientY;

    // Move the tree on mouse move
    document.onmousemove = (e) => {
      e.preventDefault();
      // Calculate the change in mouse position
      let xChange = e.clientX - mouseX;
      let yChange = e.clientY - mouseY;
      let currentLeft = parseInt(treeRef.current.style.left, 10);
      let currentTop = parseInt(treeRef.current.style.top, 10);
      treeRef.current.style.left = `${currentLeft + xChange}px`;
      treeRef.current.style.top = `${currentTop + yChange}px`;
      // Update the mouse position
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Stop dragging when the mouse is released
    document.onmouseup = (e) => {
      e.preventDefault();
      treeRef.current.style.cursor = "default";
      document.onmouseup = null;
      document.onmousemove = null;
    };
  };

  // Adjust the tree position to centre the selected node.
  const recenterNode = () => {
    const selectedNode = nodes.find((node) => node.data.id === path[0].data.id);
    if (!selectedNode) return;
    // Centre the tree on the selected node using the x and y positions of the node
    treeRef.current.style.left = `-${selectedNode.x - widgetRef.current.getBoundingClientRect().width / 3}px`;
    treeRef.current.style.top = `-${selectedNode.y - widgetRef.current.getBoundingClientRect().height / 3}px`;
  };

  // When the tree data changes, centre the tree on the selected node.
  // Centre the tree on the selected node using the x and y positions of the node.
  useEffect(() => {
    recenterNode();
  }, [treeData]);

  return (
    <div ref={treeRef} className={styles.tree} onMouseDownCapture={dragHandler}>
      {/* A large svg use to draw the paths between the nodes. */}
      <svg width={svgWidth} height={svgHeight}>
        <g>
          {links.map((link, index) => {
            let ancestor =
              path.includes(link.target.node) ||
              (path.includes(link.source.node) && link.source.node == path[0]);

            return <Branch key={index} link={link} ancestor={ancestor} />;
          })}
        </g>
      </svg>

      {/* The nodes of the tree */}
      {nodes.map((node, index) => {
        let selected = path.includes(node);
        if (path[0].children)
          selected = selected || path[0].children.includes(node);

        return <Node key={index} selected={selected} node={node} larger={larger} />;
      })}
    </div>
  );
}
