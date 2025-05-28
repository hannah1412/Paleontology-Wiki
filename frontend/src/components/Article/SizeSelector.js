import React, { useState} from "react";
import styles from "./FilterButton.module.css";
import {
  fontStyles,
  DEFAULT_FONT_SIZE,
  DEFAULT_CHAR_SPACE_SIZE,
  DEFAULT_INTER_WORD_SPACE_SIZE,
  DEFAULT_LINE_SPACE_SIZE,
} from "./ArticlePage.tsx";

{/*From Group 23*/}
/**
 * Font Size component for Accessibility
 * @param {Object} props properties
 * @returns Font Settings panel
 */
export default function FontSizeSlider(props) {
    const {
        fontSize,
        charSpaceSize,
        interWordSpaceSize,
        lineSpaceSize,
        setFontSize,
        setCharSpaceSize,
        setInterWordSpaceSize,
        setLineSpaceSize,
      } = props;

      const buttonStyles = fontStyles(
        fontSize,
        charSpaceSize,
        interWordSpaceSize,
        lineSpaceSize,
      );
    
      // states for changing fonts
      const [showDropdown, setShowDropdown] = useState(false);
      const [tempFontSize, setTempFontSize] = useState(fontSize * 10);
      const [tempCharSpace, setTempCharSpace] = useState(charSpaceSize * 100);
      const [tempInterWordSpace, setTempInterWordSpace] = useState(
        interWordSpaceSize * 10,
      );
      const [tempLineSpace, setTempLineSpace] = useState(lineSpaceSize * 10);
    
      // closes the dropdown
      const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
      };
    
      // general slider format with label
      const renderSlider = (
        label,
        onChange,
        value,
        min,
        max,
        step,
        divisor,
        spanLabel,
      ) => (
        <div className={styles["font-settings-sections"]}>
          <p
            style={fontStyles(
              fontSize,
              charSpaceSize,
              interWordSpaceSize,
              lineSpaceSize,
            )}
          >
            {label}
          </p>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className={styles["slider"]}
          />
          <span style={buttonStyles}>
            {value / divisor}
            {spanLabel}
          </span>
        </div>
      );
    
      // changes the font size
      const handleFontSizeChange = (e) => {
        const newFontSize = parseInt(e.target.value);
        setTempFontSize(newFontSize);
      };
      // changes the character spacing
      const handleCharacterSpacingChange = (e) => {
        const newCharSize = parseInt(e.target.value);
        setTempCharSpace(newCharSize);
      };
      // handles interWord spacing
      const handleInterWordSpacingChange = (e) => {
        const newWordSpaceSize = parseInt(e.target.value);
        setTempInterWordSpace(newWordSpaceSize);
      };
      // handles line spacing
      const handleLineSpacingChange = (e) => {
        const newLineSpaceSize = parseInt(e.target.value);
        setTempLineSpace(newLineSpaceSize);
      };
    
      // saves changes for custom preferences
      const handleCustomChange = (e) => {
        setFontSize(tempFontSize / 10);
        setCharSpaceSize(tempCharSpace / 100);
        setInterWordSpaceSize(tempInterWordSpace / 10);
        setLineSpaceSize(tempLineSpace / 10);
        toggleDropdown();
      };
    
      // saves changes for default dyslexia settings
      const handleResetToDefault = (e) => {
        setFontSize(DEFAULT_FONT_SIZE);
        setCharSpaceSize(DEFAULT_CHAR_SPACE_SIZE);
        setInterWordSpaceSize(DEFAULT_INTER_WORD_SPACE_SIZE);
        setLineSpaceSize(DEFAULT_LINE_SPACE_SIZE);
        toggleDropdown();
        setVals(
          DEFAULT_FONT_SIZE,
          DEFAULT_CHAR_SPACE_SIZE,
          DEFAULT_INTER_WORD_SPACE_SIZE,
          DEFAULT_LINE_SPACE_SIZE,
        );
      };
    
      // sets temporary values for custom settings
      function setVals(fontSize, charSpacing, interWordSpacing, lineSpacing) {
        setTempFontSize(fontSize * 10);
        setTempCharSpace(charSpacing * 100);
        setTempInterWordSpace(interWordSpacing * 10);
        setTempLineSpace(lineSpacing * 10);
      }
    
      // all buttons to save changes
      const buttons = [
        { text: "Save", onClick: handleCustomChange },
        { text: "Restore Default", onClick: handleResetToDefault },
      ];
    
      // returns component
      return (
        <div className={styles.dropdown}>
          <button
            className={`${styles["button-toggle"]} ${showDropdown ? styles.show : ""}`}
            onClick={toggleDropdown}
          >
            Font Settings
          </button>
    
          {/* div of sliders */}
          <div
            className={`${styles["dropdown-content-font"]} ${showDropdown ? styles.show : ""}`}
          >
            {renderSlider(
              "Font Size:",
              handleFontSizeChange,
              tempFontSize,
              9,
              15,
              1,
              10,
              "",
            )}
            {renderSlider(
              "Character Spacing:",
              handleCharacterSpacingChange,
              tempCharSpace,
              0,
              30,
              3,
              100,
              "",
            )}
            {renderSlider(
              "Inter-word Spacing:",
              handleInterWordSpacingChange,
              tempInterWordSpace,
              0,
              10,
              1,
              10,
              "",
            )}
            {renderSlider(
              "Line Spacing:",
              handleLineSpacingChange,
              tempLineSpace,
              10,
              20,
              1,
              10,
              "",
            )}
    
            <div className={styles["settings-buttons-container"]}>
              {buttons.map((button, index) => (
                <button
                  key={index}
                  style={buttonStyles}
                  onClick={button.onClick}
                  className={styles["settings-buttons"]}
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    