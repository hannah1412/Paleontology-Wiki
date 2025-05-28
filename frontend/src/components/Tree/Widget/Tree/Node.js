import React from "react";
import styles from "./Node.module.css";

export default function Node({ selected, node, larger }) {
  // Position the node relative to the parent node so that it is in the calculated tree
  // position.
  const nodeStyling = { translate: `${node.x}px ${node.y}px` };
  const classes = `${styles.node_button} ${selected ? styles.selected : styles.soften} ${larger ? styles.larger : ""}`;

  return (
    <div style={nodeStyling} className={styles.node}>
      <button className={classes}>{node.data.name}</button>
    </div>
  );
}
