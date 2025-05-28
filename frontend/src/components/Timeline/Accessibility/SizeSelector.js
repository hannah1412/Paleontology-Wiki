import { useState } from 'react';
import styles from '../Styles/FilterButton.module.css';
import {fontStyles, DEFAULT_FONT_SIZE, DEFAULT_CHAR_SPACE_SIZE, DEFAULT_INTER_WORD_SPACE_SIZE, DEFAULT_LINE_SPACE_SIZE} from '../TimelinePage.js';
import {useSelector } from 'react-redux';

/**
 * Font Size component for Accessibility
 * @param {Object} props properties
 * @returns Font Settings panel
 */
export default function FontSizeSlider(props) {
    const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
    
    const { fontSize, setFontSize,
            charSpacing, setCharSpacing,
            interWordSpacing, setInterWordSpacing,
            lineSpacing, setLineSpacing
             } = props;
    const buttonStyles = fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing);

    // states for changing fonts
    const [showDropdown, setShowDropdown] = useState(false);
    const [tempFontSize, setTempFontSize] = useState(fontSize);
    const [tempCharSpace, setTempCharSpace] = useState(charSpacing);
    const [tempInterWordSpace, setTempInterWordSpace] = useState(interWordSpacing);
    const [tempLineSpace, setTempLineSpace] = useState(lineSpacing);

    // closes the dropdown
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // general slider format with label
    const renderSlider = (label, onChange, value, min, max, step, divisor, spanLabel) => (
        <div className={styles['font-settings-sections']}>
            <p style={fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing)} >{label}</p>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className={styles['slider']}
            />
            <span style={buttonStyles}>{value/divisor}{spanLabel}</span>
        </div>
    );

    // changes the font size
    const handleFontSizeChange = (e) => {
        const newFontSize = parseInt(e.target.value);
        setTempFontSize(newFontSize)
    };

    // changes the character spacing
    const handleCharacterSpacingChange = (e) => {
        const newCharSize = parseInt(e.target.value);
        setTempCharSpace(newCharSize)
    };

    // handles interWord spacing
    const handleInterWordSpacingChange = (e) => {
        const newWordSpaceSize = parseInt(e.target.value);
        setTempInterWordSpace(newWordSpaceSize)
    };

    // handles line spacing
    const handleLineSpacingChange = (e) => {
        const newLineSpaceSize = parseInt(e.target.value);
        setTempLineSpace(newLineSpaceSize)
    };

    // saves changes for custom preferences
    const handleCustomChange = (e) => {
        setFontSize(tempFontSize);
        setCharSpacing(tempCharSpace);
        setInterWordSpacing(tempInterWordSpace);
        setLineSpacing(tempLineSpace);
        toggleDropdown();
    }

    // saves changes for default dyslexia settings
    const handleDyslexiaFriendly = (e) => {
        setFontSize(DEFAULT_FONT_SIZE);
        setCharSpacing(DEFAULT_CHAR_SPACE_SIZE); 
        setInterWordSpacing(DEFAULT_INTER_WORD_SPACE_SIZE);
        setLineSpacing(DEFAULT_LINE_SPACE_SIZE);
        toggleDropdown();
        setVals(DEFAULT_FONT_SIZE, DEFAULT_CHAR_SPACE_SIZE, DEFAULT_INTER_WORD_SPACE_SIZE, DEFAULT_LINE_SPACE_SIZE);
    }

    // sets temporary values for custom settings
    function setVals(fontSize, charSpacing, interWordSpacing, lineSpacing) {
        setTempFontSize(fontSize);
        setTempCharSpace(charSpacing);
        setTempInterWordSpace(interWordSpacing);
        setTempLineSpace(lineSpacing);
    }

    // all buttons to save changes
    const buttons = [
        { text: 'Save', onClick: handleCustomChange},
        { text: 'Dyslexia-Friendly', onClick: handleDyslexiaFriendly}
    ];

    // returns component
    return (
        <div className={styles.dropdown}>
            <button
                style={buttonStyles} 
                className={`${styles['button-toggle']} ${showDropdown ? styles.show : ''}` + ` ${(reduceMotion) ? styles["reduce"] : ""}`}
                onClick={toggleDropdown}>
                Font Settings
            </button>

            {/* div of sliders */}
            <div className={`${styles['dropdown-content-font']} ${showDropdown ? styles.show : ''}`}>
                {renderSlider('Font Size:', handleFontSizeChange, tempFontSize, 5, 15, 1, 10, 'x')}
                {renderSlider('Character Spacing:', handleCharacterSpacingChange, tempCharSpace, 1, 40, 1, 100, 'x')}
                {renderSlider('Inter-word Spacing:', handleInterWordSpacingChange, tempInterWordSpace, 10, 40, 1, 10, 'x')}
                {renderSlider('Line Spacing:', handleLineSpacingChange, tempLineSpace, 12, 18, 1, 10, 'x')}

                <div className= {styles["settings-buttons-container"]}>
                    {buttons.map((button, index) => (
                        <button
                            key={index}
                            style={buttonStyles} 
                            onClick={button.onClick}
                            className= {styles["settings-buttons"]}>
                            {button.text}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}