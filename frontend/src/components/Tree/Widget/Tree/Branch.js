import React from "react";
import styles from "./Branch.module.css";

export default function Branch({ link, ancestor }) {
  // Get the rem value from the root element
  const remValue =
    typeof window !== "undefined"
      ? parseFloat(getComputedStyle(document.documentElement).fontSize)
      : 16;
  const separation = 5 * remValue;
  const x1 = link.source.x;
  const y1 = link.source.y;
  const x2 = link.target.x;
  const y2 = link.target.y;

  // Construct the path for the branch using the calculated positions
  const path = `M${x1 + separation},${y1} L${x2 + separation},${y2}`;
  // Style the path based on whether it is an ancestor or not
  const classes = `${styles.path} ${ancestor ? "" : styles.soften}`;

  return <path className={classes} d={path} />;
}
