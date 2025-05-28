// ModeToggle.js
'use client';

import styles from '../Styles/ModeToggle.module.css';
import {fontStyles} from '../TimelinePage.js';
import {useSelector } from 'react-redux';
const HEADING_MULTIPLIER = 1.2

/**
 * creates toggle to switch between displays
 * @param {Object} param properties
 * @returns 
 */
export default function ModeToggle({histroMode, setHistroMode, fontSize, charSpacing, lineSpacing, interWordSpacing}) {
    const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
    const buttonStyles = fontStyles(fontSize*HEADING_MULTIPLIER, charSpacing, interWordSpacing, lineSpacing);

    /**
     * changes mode
     */
    const handleToggle = () => {
        setHistroMode(!histroMode);
    };

    /**
     * handles keyboard navigation
     * switches mode when enter pressed
     * @param {*} event 
     */
    function handleKeyDown(event) {
        if (event.key === 'Enter') {
          handleToggle();
        }
    }

    /**
     * returns mode toggle component
     */
    return (
        <div style={buttonStyles} tabIndex={0}  onKeyDown={handleKeyDown}  className={styles.toggleContainer} onClick={handleToggle}>
            <div className={`${styles.toggleButton} ${histroMode ? styles.toggleOn : styles.toggleOff}`}>
                <span className={styles.toggleLabelOn}>Cards</span>
                <div className={`${styles.toggleCircle} ${histroMode ? styles.circleOn : styles.circleOff}` + ` ${(reduceMotion) ? styles["reduce"] : ""}`}/>
                <span className={styles.toggleLabelOff}>Timeline</span>
            </div>
        </div>
    );
}
