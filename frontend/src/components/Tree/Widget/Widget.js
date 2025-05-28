"use client";

import React, { useState, useEffect, Fragment, useRef } from "react";
import { hierarchy, tree } from "d3-hierarchy";
import Link from "next/link";
import Tree from "@/components/Tree/Widget/Tree/Tree";
import styles from "./Widget.module.css";

const Widget = ({ qNumber, larger }) => {
  const [treeData, setTreeData] = useState({});
  const [currentClassification, setCurrentClassification] = useState();
  const widgetRef = useRef();

  // When the tree data or the selected node changes, update the tree.
  // Get the possible d3 summary data trees from the backend.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/summary/${qNumber}`,
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const _data = await res.json();
        const summary = {};
        for (const key in _data) {
          summary[key] = constructTree(_data[key], qNumber);
        }

        setTreeData(summary);
        if (Object.keys(summary).length > 0) {
          setCurrentClassification(Object.keys(summary)[0]);
        }
      } catch (error) {
        setTreeData({});
      }
    };
    fetchData();
  }, [qNumber]);

  return (
    <div
      className={`${styles.widget} ${larger ? styles.larger : ""}`}
      ref={widgetRef}
    >
      {Object.keys(treeData).length == 0 ? (
        <p>
          No data available. Check out the other cladogram of other species{" "}
          <Link href="/cladogram">here</Link>.
        </p>
      ) : (
        <Fragment>
          <select
            className={styles.select}
            onChange={(e) => setCurrentClassification(e.target.value)}
          >
            {Object.keys(treeData).map((classification, index) => {
              let name = "";
              if (classification === "benton") {
                name = "Benton Classification";
              } else if (classification === "bnb") {
                name = "Baron/Norman/Barrett Classification";
              } else if (classification === "wdo") {
                name = "Weishampel/Dodson/Osmólska Classification";
              }
              return (
                <option key={index} value={classification}>
                  {name}
                </option>
              );
            })}
          </select>
          <Tree
            treeData={treeData[currentClassification]}
            widgetRef={widgetRef}
            larger={larger}
          />
        </Fragment>
      )}
    </div>
  );
};
export default Widget;

/**
 * Convert d3 tree data to a format that can be used by the Tree component.
 * @param {*} data a series of nested objects following the d3 hierarchy format
 * @param {*} selectedNode the id of the node that is currently selected
 * @returns the data in a format that can be used by the Tree component and the
 *          size of the svg container
 */
function constructTree(data, selectedNode) {
  // Implement relative sizing based on user preferences
  const remValue =
    typeof window !== "undefined"
      ? parseFloat(getComputedStyle(document.documentElement).fontSize)
      : 16;

  // Use d3 to construct the top down tree
  const root = hierarchy(data);
  const svgSize = [
    root.height * 1000 * remValue,
    root.height * 1000 * remValue,
  ];
  const nodeSize = [12 * remValue, 15 * remValue];
  const layout = tree().size(svgSize).nodeSize(nodeSize)(root);

  // The path to the selected node
  let path;

  const links = layout.links().map((link) => {
    return {
      depth: link.source.depth,
      source: {
        node: link.source,
        x: link.source.x + svgSize[0] / 2,
        y: link.source.y + 2 * remValue + svgSize[1] / 2,
      },
      target: {
        node: link.target,
        x: link.target.x + svgSize[0] / 2,
        y: link.target.y + svgSize[1] / 2,
      },
    };
  });
  const nodes = layout.descendants().map((node) => {
    node.data = node.data;
    node.x = node.x + svgSize[0] / 2;
    node.y = node.y + svgSize[1] / 2;

    if (selectedNode && node.data.id === selectedNode) {
      path = node.ancestors();
    }
    return node;
  });

  // Return the data in a format that can be used by the Tree component
  return {
    svgSize: svgSize,
    data: { links, nodes },
    path: path ? path : [nodes[0]],
  };
}
