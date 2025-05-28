import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { accessibilityActions } from "@/store/accessibility-slice";

import styles from "./AccessibilityMenu.module.css";

const AccessibilityMenu = (props) => {
  const dispatch = useDispatch();
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);

  const toggleReduceMotion = () => {
    dispatch(accessibilityActions.toggleReduceMotion());
  };

  return (
    <div className={`accessibility ${styles.menu} ${props.className}`}>
      <h1 className={`accessibility ${styles.title}`}>Accessibility Menu:</h1>
      <div>
        <input className={`accessibility ${styles.checkbox}`} onChange={toggleReduceMotion} type="checkbox" id="reduce-motion-checkbox" checked={reduceMotion} />
        <p className={`accessibility ${styles.label}`} htmlFor="reduce-motion-checkbox">Reduce Motion</p>
      </div>
    </div>
  );
};
export default AccessibilityMenu;
