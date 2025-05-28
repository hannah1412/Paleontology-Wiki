import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faCircleNodes,
  faSitemap,
  faCircleArrowLeft,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
} from "@fortawesome/free-solid-svg-icons";
import { TreeContext } from "@/store/TreeContextProvider";
import { TreeFontContext, fontStyles } from "@/store/TreeFontContextProvider";
import FontSizeSlider from "@/components/Tree/Visualisation/Menu/FontControl/FontControl";
import styles from "./Menu.module.css";

const Menu = () => {
  const {
    treeType,
    classification,
    expanded,
    root,
    zoomFactor,
    setTreeType,
    setClassification,
    setExpanded,
    setRoot,
    setZoomFactor,
  } = useContext(TreeContext);
  const { fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize } =
      useContext(TreeFontContext);
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
  const selectRef = useRef();

  const handleChange = (e) => {
    setClassification(e.target.value);
  };

  // Create a hidden element to get the size of the select dropdown with a specific word.
  useEffect(() => {
    const hiddenElement = document.createElement("span");
    hiddenElement.style.fontSize = `${fontSize + 0.1}em`;
    hiddenElement.style.letterSpacing = `${charSpaceSize}em`;
    hiddenElement.style.wordSpacing = `${interWordSpaceSize}em`;
    hiddenElement.style.lineHeight = `${lineSpaceSize}em`;
    hiddenElement.style.visibility = "hidden";
    hiddenElement.style.display = "inline";
    hiddenElement.classList.add(styles.heading);
    hiddenElement.textContent =
        selectRef.current.options[selectRef.current.selectedIndex].textContent;
    document.body.appendChild(hiddenElement);
    const width = hiddenElement.offsetWidth;
    document.body.removeChild(hiddenElement);
    // Set the width of the select to the width of the text plus 20px for the arrow
    selectRef.current.style.width = `${width + 20}px`;
  }, [
    classification,
    fontSize,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  ]);

  const headingStyle = fontStyles(
      fontSize + 0.1,
      charSpaceSize,
      interWordSpaceSize,
      lineSpaceSize,
  );
  const fontStyle = fontStyles(
      fontSize,
      charSpaceSize,
      interWordSpaceSize,
      lineSpaceSize,
  );
  const tooltipStyle = fontStyles(
      fontSize - 0.25,
      charSpaceSize,
      interWordSpaceSize,
      lineSpaceSize,
  );

  return (
      <section
          className={`${styles.panel} ${!reduceMotion ? styles.animate : ""}`}
      >
        <div className={styles.menu}>
          <div className={styles.actions}>
            <button
                style={fontStyle}
                className={`${styles.button} ${treeType != "radial" ? styles.inactive : ""}`}
                onClick={() => setTreeType("radial")}
                alt="Open Radial Tree"
            >
              <FontAwesomeIcon icon={faCircleNodes} className={styles.icon} />
              Radial
            </button>
            <button
                style={fontStyle}
                className={`${styles.button} ${treeType != "tree" ? styles.inactive : ""}`}
                onClick={() => setTreeType("tree")}
                alt="Open Linear Tree"
            >
              <FontAwesomeIcon icon={faSitemap} className={styles.icon} />
              Linear
            </button>
          </div>
          <div className={styles.padding} />
          <select
              ref={selectRef}
              style={headingStyle}
              className={styles.heading}
              onChange={handleChange}
              disabled = {reduceMotion && treeType === "radial"}
          >
            <option value="benton">Benton classification</option>
            <option value="bnb">Baron/Norman/Barrett classification</option>
            <option value="wdo">Weishampel/Dodson/Osmólska classification</option>
          </select>
        </div>

        <div className={styles.menu_actions}>
          <button
              className={
                root
                    ? `${styles.back_button}`
                    : `${styles.back_button} ${styles.hidden}`
              }
              onClick={() => {
                setRoot(null);
              }}
              style={fontStyle}
          >
            <FontAwesomeIcon icon={faCircleArrowLeft} className={styles.icon} />{" "}
            Back to Dinosauria
          </button>

          <div className={reduceMotion && treeType === "radial" ? `${styles.toggle} ${styles.hidden}` : `${styles.toggle}`}>
            <input
                style={fontStyle}
                type="checkbox"
                onChange={() => setExpanded(!expanded)}
            />
            <p style={fontStyle}>
              Show potential genus
              <span className={styles.tooltip}>
              <FontAwesomeIcon
                  icon={faCircleInfo}
                  className={styles.info_icon}
              />
              <span className={styles.tooltiptext} style={tooltipStyle}>
                Extend the classification with additional clades and species
              </span>
            </span>
            </p>
          </div>

          <div
              className={
                treeType == "tree"
                    ? `${styles.zoom_controls}`
                    : `${styles.zoom_controls} ${styles.hidden}`
              }
          >
            <button
                onClick={() => {
                  if (zoomFactor < 1.25) setZoomFactor(zoomFactor + 0.25);
                }}
                className={`${styles.zoom_button} ${zoomFactor == 1.25 ? styles.inactive : ""}`}
                style={fontStyle}
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
            </button>
            <button
                onClick={() => {
                  if (zoomFactor > 0.25) setZoomFactor(zoomFactor - 0.25);
                }}
                className={`${styles.zoom_button} ${zoomFactor == 0.25 ? styles.inactive : ""}`}
                style={fontStyle}
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
            </button>
          </div>

          <FontSizeSlider />
        </div>
      </section>
  );
};
export default Menu;
