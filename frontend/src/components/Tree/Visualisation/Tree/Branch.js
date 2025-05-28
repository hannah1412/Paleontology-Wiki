import React, { useContext } from "react";
import { TreeContext } from "@/store/TreeContextProvider";
import styles from "./Branch.module.css";

export default function Branch({ link, ancestor }) {
  const { path } = useContext(TreeContext);
  // Deconstruct the link object to get the source and target positions
  const remValue =
    typeof window !== "undefined"
      ? parseFloat(getComputedStyle(document.documentElement).fontSize)
      : 16;
  const separation = 10 * remValue * (link.depth + 1);
  const x1 = link.source.x;
  const y1 = link.source.y;
  const x2 = link.target.x;
  const y2 = link.target.y;

  // Construct the path for the branch using the calculated positions
  const linePath = `
  M${x1 + separation},
  ${y1}C${(x1 + x2) / 2 + separation},
  ${y1} ${(x1 + x2) / 2 + separation},
  ${y2} ${x2 + separation},
  ${y2}`;

  const classes = `${styles.path} ${path.includes(link.target.node) ? "" : styles.soften}`;

  return <path className={classes} d={linePath} />;
}
