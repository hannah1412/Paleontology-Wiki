import React, { useEffect, useRef, useContext } from "react";
import dynamic from "next/dynamic";
import { hierarchy, tree } from "d3-hierarchy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Menu from "@/components/Tree/Visualisation/Menu/Menu";
import Tree from "@/components/Tree/Visualisation/Tree/Tree";
const RadialTree = dynamic(
  () => import("@/components/Tree/Visualisation/RadialTree/Tree"),
  { ssr: false },
);
import InformationCard from "@/components/Tree/Visualisation/InformationCard/InformationCard";
import { TreeContext } from "@/store/TreeContextProvider";
import { TreeFontContext, fontStyles } from "@/store/TreeFontContextProvider";
import styles from "./Visualisation.module.css";

const Visualisation = ({ setShowIntro }) => {
  const {
    treeType,
    treeData,
    classification,
    root,
    expanded,
    selectedNode,
    setRadialData,
    setTreeData,
    setPath,
    setWindowRef,
  } = useContext(TreeContext);
  const { fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize } =
    useContext(TreeFontContext);
  const windowRef = useRef();

  useEffect(() => {
    // Fetch the tree data from the backend and save it in the context.
    const getTreeDate = async () => {
      try {
        // Build the url to fetch the tree data.
        let urlString = `${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/${classification}`;
        if (root) {
          urlString += `?root_id=${root}`;
          if (expanded) {
            urlString += `&expanded=${expanded}`;
          }
        } else if (expanded) {
          urlString += `?expanded=${expanded}`;
        }

        // Fetch the tree data
        const res = await fetch(urlString);
        if (!res.ok) {
          setTreeData("failed");
        } else {
          const _data = await res.json();

          // Save the d3 data for the radial tree
          setRadialData(_data);
          // Convert the data to a format that can be used by the Tree component
          const { svgSize, data, initialNode } = constructTree(
            _data,
            selectedNode,
          );
          setTreeData({ data, svgSize });
          setPath(initialNode);
          setWindowRef(windowRef);
        }
      } catch (error) {}
    };
    getTreeDate();
  }, [classification, root, expanded]);

  const headingStyle = fontStyles(
    fontSize + 0.2,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );
  const paragraphStyle = fontStyles(
    fontSize - 0.2,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );
  const buttonStyle = fontStyles(
    fontSize,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );

  // Set a default message if the tree data is not available/failed to load.
  if (treeData == "failed") {
    return (
      <section ref={windowRef} className={styles.window}>
        <Menu />
        <div className={styles.error_panel}>
          {/* Adjusts the message depending on whether the tree is looking for a specific node. */}
          <h2 style={headingStyle}>
            {root ? "Failed to load tree data" : "Failed to load tree data"}
          </h2>
          <p style={paragraphStyle}>
            {root
              ? "There was an error loading the tree data for the selected node. Please try again later."
              : "There was an error loading the tree data. Please try again later."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={windowRef} className={styles.window}>
      <Menu />
      {treeType == "tree" && <InformationCard />}

      {treeData &&
        (treeType === "radial" ? (
          <RadialTree />
        ) : (
          <Tree windowRef={windowRef} />
        ))}

      <button
        className={styles.help_button}
        onClick={() => {
          setShowIntro(true);
        }}
        style={buttonStyle}
      >
        <FontAwesomeIcon icon={faCircleInfo} className={styles.icon} /> Help
      </button>
    </section>
  );
};
export default Visualisation;

/**
 * Convert d3 tree data to a format that can be used by the Tree component.
 * @param {*} data a series of nested objects following the d3 hierarchy format
 * @param {*} selectedNode the id of the node that is currently selected
 * @returns the data in a format that can be used by the Tree component and the
 *          size of the svg container
 */
function constructTree(data, selectedNode) {
  // Implement relative sizing based on user preferences
  const remValue = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );

  // Use d3 to construct the top down tree
  const root = hierarchy(data);
  const svgSize = [
    root.height * 2500 * remValue,
    root.height * 2500 * remValue,
  ];
  const nodeSize = [5 * remValue, 25 * remValue];
  const layout = tree().size(svgSize).nodeSize(nodeSize)(root);
  let initialNode = null;

  // Convert top-down to left-right and centre the tree
  const links = layout.links().map((link) => {
    return {
      depth: link.source.depth,
      source: {
        node: link.source,
        x: link.source.y + 2.5 * remValue + svgSize[0] / 2,
        y: link.source.x + svgSize[1] / 2,
      },
      target: {
        node: link.target,
        x: link.target.y + svgSize[0] / 2,
        y: link.target.x + svgSize[1] / 2,
      },
    };
  });
  const nodes = layout.descendants().map((node) => {
    node.data = node.data;
    let temp = node.x;
    node.x = node.y + node.depth * (remValue * 10) + svgSize[0] / 2;
    node.y = temp + svgSize[1] / 2;

    if (selectedNode && node.data.id === selectedNode) {
      initialNode = node;
    }

    return node;
  });

  // Return the data in a format that can be used by the Tree component
  return {
    svgSize: svgSize,
    data: { links, nodes },
    initialNode: initialNode ? initialNode : nodes[0],
  };
}
