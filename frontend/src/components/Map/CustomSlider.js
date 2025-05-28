import React, { useState } from "react";
import styles from "./CSS/Slider.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTextHeight} from "@fortawesome/free-solid-svg-icons";

/**
 * Creates a slider to change the font size and letter spacing
 * @param {*} onChange Handles the change of font size
 * @returns The slider
 */
const CustomSlider = ({ onChange }) => {
  const [value, setValue] = useState(16);

  // Handles slide event
  const handleChange = (event) => {
    const newValue = parseInt(event.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  //  SLIDER  //
  return (
    <div className={styles["slider"]}>
      <FontAwesomeIcon className={styles["slider_icon"]} icon={faTextHeight} />
      <input className={styles["fontSlider"]}
        type="range"
        min={10}
        max={32}
        step={1}
        value={value}
        onChange={handleChange}
      />
      
    </div>
  );
};

export default CustomSlider;