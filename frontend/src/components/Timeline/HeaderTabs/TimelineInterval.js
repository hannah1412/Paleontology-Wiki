"use client";

import React, { useState, useEffect, Fragment } from "react";
import styles from "../Styles/TimelineInterval.module.css";
import Search from './Search'
import periodsAndTimes from './PeriodsAndTimes.json';
import {fontStyles, SIZE_LINE_DIVIDER, DEFAULT_FONT_SIZE, DEFAULT_CHAR_SPACE_SIZE, DEFAULT_INTER_WORD_SPACE_SIZE, DEFAULT_LINE_SPACE_SIZE} from '../TimelinePage.js';
import {useSelector } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus, faArrowRightLong, faArrowLeftLong, faMinus } from "@fortawesome/free-solid-svg-icons";
import { relative } from "path";


//icon constants
const LEFT_ARROW = <FontAwesomeIcon icon={faArrowLeftLong}style={{fontSize: '2rem', position: relative, top: '2px'}} />
const RIGHT_ARROW = <FontAwesomeIcon icon={faArrowRightLong} style={{fontSize: '2rem', position: relative, top: '2px'}}/>
const ZOOM_IN = <FontAwesomeIcon icon={faMagnifyingGlassPlus} fontSize='1.75rem'/>
const ZOOM_OUT = <FontAwesomeIcon icon={faMagnifyingGlassMinus} fontSize='1.75rem'/>
const DASH = <FontAwesomeIcon icon={faMinus}style={{fontSize: '1.25rem'}} />
const ZOOM_CHANGE_CONST = 0.5
const NUM_INTERVALS = 2;

const QUERY_FORMATTER =  '-01-01T00:00:00Z';
const TIMELINE_START = -540
const TIMELINE_END = 0.002024
const INITIAL_FONT = 12
const MILLION = 1000000


/**
 * formats the year string to be more readable
 * @param {*} year year to format for UI display
 * @returns year string
 */
function formatYear(year) {
    let yearString = "0";
    if (year < 0) {
        yearString = year.substring(1) + "M";
    }
    else {
        yearString = year + "M";
    }
    return yearString;
} 

/**
 * rounds the year and converts to a string
 * @param {*} year year to round
 * @returns rounded year in string format
 */
function roundYear(year) {
    if (year > 0) {
        year = '+' + parseFloat(year).toFixed(6).toString();
    } else {
        year = year.toFixed(1).toString();
    }
    return year;
}

/**
 * calculates the year range for the specific timeline
 * @param {*} year year to calculate range
 * @param {*} yearRange year range between each interval
 * @param {*} startYear start year being displayed on the screen
 * @param {*} endYear end year being displayed on the screen
 * @returns 
 */
function calculateYearRange(year, yearRange, startYear, endYear) {
    const halfRange = yearRange/2;
    year = parseFloat(year.slice(0, -1))
    const startRange =(year + halfRange).toFixed(1);
    const endRange = (year - halfRange).toFixed(1) ;
    let specificRange = startRange + " - " + endRange

    // creates the specific range display screen
    if (year == Math.abs(startYear)) {
        specificRange = year + " - " + endRange
    }
    else if (year == Math.abs(endYear)) {
        specificRange = startRange + " - " + year
    }
    else {
        specificRange = startRange + " - " + endRange
    }

    return specificRange;
} 

/**
 * calculates the specific year to set the new start and end times for queries
 * @param {*} year year being clicked on
 * @param {*} yearRange year range between displays (year range of period / zoom level)
 * @param {*} startYear start year of period
 * @param {*} endYear end year of period
 * @param {*} type start or end date to return
 * @returns start or end date to change queries
 */
function calculateSpecificYear(year, yearRange, startYear, endYear, type) {
    const halfRange = yearRange/2;
    year = parseFloat(year.slice(0, -1))
    let specificYear;

    // formats start year
    if (type == "start") {
        if (year == Math.abs(startYear)) {
            specificYear = startYear
        }
        else {
            specificYear = (year + halfRange).toFixed(1)*(-1)
        }
    }

    // formats end year
    else if (type == "end") {
        if (year == Math.abs(endYear)) {
            specificYear = endYear
        }
        else {
            specificYear = (year - halfRange).toFixed(1)*(-1)
        }
    }
    return specificYear
}

/**
 * formats string to be used in query
 * @param {int} time year to foramt for query
 * @returns formatted query string
 */
function formatString(time){
    let timeString = "";
    let padding = String((time*MILLION).toFixed(1));

    // removes decimal
    if (padding.indexOf(".") !== -1) {
        let index = padding.indexOf(".")
        padding = padding.slice(0, index)
    }

    // formats based on AD and BC 
    if (time < 0) {
        timeString = timeString + padding + QUERY_FORMATTER
    }
    else {
        timeString = "+" + timeString + padding + QUERY_FORMATTER
    }
    return timeString
}

/**
 * remove the formatted string's end
 * @param {string} time time to change
 * @returns unformatted string to be used for calculations
 */
function unformatString(time){
    let result = parseInt(time.replace(QUERY_FORMATTER, ''))/MILLION;
    return result
}


/**
 * create zoomed in intervals
 * @param {Object} props properties passed in
 * @returns range of years divided equally and returned as buttons
 */
export default function TimelineInterval(props) {
    let yearRange;
    let isLeftArrHidden = false;
    let isRightArrHidden = false;

    const {period, setPeriod, startYear, endYear, setStartYear, setEndYear,
            startTime, endTime,
            timeRange, setTimeRange, setStartTime, setEndTime, 
            displayStartCount, setDisplayStartCount, 
            fontSize, charSpacing, lineSpacing, interWordSpacing} = props;

    const [specificTimeline, setSpecificTimeline] = useState(false);
    const [yearClicked, setYearClicked] = useState();
    const [specificRangeDisplay, setSpecificRangeDisplay] = useState();
    const [zoomLevel, setZoomLevel] = useState(1);
    const [zoomChange, setZoomChange] = useState(1);
    const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);

    // reloads timeline interval when period or zoom level changes
    useEffect(() => {
        setSpecificTimeline(false)
        setYearClicked() 
	}, [period, zoomLevel, displayStartCount]);

    

    /**
     * creates buttons
     * @param {Object} props handles on click functions
     * @returns button with year value
     */
    function Button(props) {
        const buttonClassName = `${styles["time-period"]} ${props.isSelected ? styles["selected"] : ''} ${props.isArrow ? styles["arrow"] : ''} ${props.isArrowHidden ? styles["hidden"] : ''}` + ` ${(reduceMotion) ? styles["reduce"] : ""}`;

        return (
            <button style={fontStyles(fontSize, charSpacing, DEFAULT_INTER_WORD_SPACE_SIZE, DEFAULT_FONT_SIZE)} 
                    className={buttonClassName} onClick={props.onClick} aria-label={props.ariaLabel}> 
                {props.value}
            </button>
        );
    }

    /**
     * create zoom button to scale the timeline
     * @param {Object} props handles on click function
     * @returns button with +/- value
     */
    function ZoomButton(props) {
        const buttonClassName = `${styles["zoom"]} + ${(reduceMotion) ? styles["reduce"] : ""}  + ${(zoomLevel==1 && props.value === ZOOM_OUT) ? styles["limit"] : "" }`;
        return (
            <button style={fontStyles(INITIAL_FONT + (fontSize/SIZE_LINE_DIVIDER), DEFAULT_CHAR_SPACE_SIZE, DEFAULT_INTER_WORD_SPACE_SIZE, DEFAULT_LINE_SPACE_SIZE)} 
                    className={buttonClassName} onClick={props.onClick} aria-label={props.ariaLabel}>
                {props.value}
            </button>
        );
    }

    /**
     * generates the time period buttons
     * @param {string} key button key
     * @param {string} value value to be displayed on button
     * @param {*} onClick specific timeline handler
     * @param {boolean} isSelected true if displaying results matching button value
     * @param {boolean} isArrow true if an arrow button
     * @param {boolean} isArrowHidden true if not arrow button
     * @param {string} ariaLabel the aria-label of the button
     * @returns timeline interval button
     */
    const generateButton = (key, value, onClick, isSelected, isArrow, isArrowHidden, ariaLabel) => (
        <Button
            key={key}
            value={value}
            onClick={() => onClick(value)}
            isSelected={isSelected}
            isArrow = {isArrow}
            isArrowHidden = {isArrowHidden}
            ariaLabel = {ariaLabel}
        />
    );

    /**
     * generates zoom button
     * @param {*} key zoom button id
     * @param {*} value + or 1, for zoom in or out
     * @param {*} onClick zoom in or our handler
     * @param {string} ariaLabel the aria-label of the button
     * @returns zoom button
     */
    const generateZoomButton = (key, value, onClick, ariaLabel) => (
        <ZoomButton
            key={key}
            value={value}
            onClick={() => onClick(value)}
            ariaLabel = {ariaLabel}
        />
    );

    /**
     * creates a zoom button container
     * @returns zooming in and out buttons in a html element
     */
    const zoomButtonPopulator = () => {
        const zoomButtons =[];
        const handleClick = (state) => {

            // if zoom level is not at start and zoom out not pressed
            if (zoomLevel != 1 || state != ZOOM_OUT) {
                // zoom in
                if (state == ZOOM_IN) {
                    setZoomChange(ZOOM_CHANGE_CONST/ zoomLevel)
                    setZoomLevel(zoomLevel+1)
                }
                // zoom out but next zoom out is start level
                else if (state == ZOOM_OUT && (zoomLevel-1) == 1) {
                    setZoomChange(1)
                    setZoomLevel(zoomLevel-1)
                    setDisplayStartCount(Math.floor(displayStartCount/2))
                }
                // zoom out
                else  if (state == ZOOM_OUT && (zoomLevel-1) != 1)  {
                    setZoomChange(ZOOM_CHANGE_CONST / (zoomLevel-2))
                    setZoomLevel(zoomLevel-1)
                    setDisplayStartCount(Math.floor(displayStartCount/2))
                }
            }
        };

        zoomButtons.push(generateZoomButton("zoomIn", ZOOM_IN, handleClick, "Zoom in"))
        zoomButtons.push(generateZoomButton("zoomOut", ZOOM_OUT, handleClick, "Zoom out"))

        // returns zoom components
        return (
            <div key= "zoomButtons" className={styles["zoom-container"]}>
                {zoomButtons}
            </div>
        )
    };

    /**
     * gets the next period name and start times from json file
     */
    function getNextPeriod() {
		let currentPeriodIndex = periodsAndTimes.findIndex(ele => ele.name == period)

		//only updates if last period not reached
		if ((currentPeriodIndex+1) < periodsAndTimes.length) {
			let {name, start, end } = periodsAndTimes.at(currentPeriodIndex+1)
            setStartYear(start)
            setEndYear(end)
            setTimeRange(Number(end) - Number(start))
            setPeriod(name)
			setDisplayStartCount(0)
		}
	}

    /**
     * gets the previous period name and start times from json file
     */
    function getPrevPeriod() {
		let currentPeriodIndex = periodsAndTimes.findIndex(ele => ele.name == period)

		//only updates if first period not reached
		if (currentPeriodIndex > 0) {
			let {name, start, end } = periodsAndTimes.at(currentPeriodIndex-1)
            setStartYear(start)
            setEndYear(end)
            setTimeRange(Number(end) - Number(start))
            setPeriod(name)
			setDisplayStartCount(zoomLevel-1)
		}
	}

    /**
     * sets the new query times
     * @param {int} counter loop counter
     * @param {int} year year to check
     */
    function setTimes(counter, year) {
        if (zoomLevel == 1 && !specificTimeline) {
            setStartTime(formatString(startYear))
            setEndTime(formatString(endYear))             
        }
        else if (counter == 0 && !specificTimeline) {
            setStartTime(formatString(year))
        }
        else if(counter == NUM_INTERVALS -1 && !specificTimeline) {
            if (zoomLevel == 1) {
                setEndTime(formatString(endYear))
            }
            else {
                setEndTime(formatString(year))
            }
        }
    }

    /**
     * creates a years button container
     * @returns year buttons with time intervals and arrows
     */
    const yearButtonPopulator = () => {
        const buttons = [];
        
        /**
         * gernerates the year buttons
         * @returns year buttons with time intervals
         */
        const generateYearButtons = () => {
            const yearButtonsList = [];
            
            for (let i = 0; i < NUM_INTERVALS; i++) {
                yearRange = (timeRange * 1000 / (NUM_INTERVALS - 1)) / 1000;
                let displayStartYear = Number(startYear) + ((NUM_INTERVALS - 1) * yearRange * zoomChange) * displayStartCount;
                let year =  roundYear( displayStartYear + i * yearRange * zoomChange);
                let formattedYear = formatYear(year);
                setTimes(i, year)

                // to highlight the selected year specified timeline belongs to
                let yearToHighlight = false;
                if (yearClicked != null) {
                    yearToHighlight = (formattedYear == yearClicked);
                }

                // changes button display value if specific timeline is required
                if(formattedYear && yearToHighlight) {
                    formattedYear = specificRangeDisplay;
                }

                // to indicate time range
                if (i == 1) {
                    yearButtonsList.push(<button aria-label="dash" style={fontStyles(fontSize, charSpacing, 0, 0)} 
                                                    className={styles["timeline-dash"]}>{DASH}</button>)
                }
                yearButtonsList.push(generateButton(i, formattedYear, handleYearClick, yearToHighlight, false, false));
            }
            return yearButtonsList;
        };

        //handle arrow button click for left and right arrows
        const handleArrowClick = (direction) => {
            if (direction == "left") {
                if (unformatString(startTime) == startYear) {
                    getPrevPeriod()
                }
                else {
                    setDisplayStartCount(displayStartCount-1)
                    setSpecificTimeline()
                }
            }
            else if (direction == "right") {
                if (unformatString(endTime) == endYear) {
                    getNextPeriod()
                }
                else {
                    setDisplayStartCount(displayStartCount+1)
                    setSpecificTimeline()
                }
            }
        };

        // if same year not clicked, display the specific timeline
        const handleYearClick = (newYearClicked) => {
            if (yearClicked != newYearClicked) {
                const newYearRange = yearRange*zoomChange;
                setYearClicked(newYearClicked)
                setSpecificTimeline(true)
                setSpecificRangeDisplay(calculateYearRange(newYearClicked, newYearRange, startYear, endYear))
                setStartTime(formatString(calculateSpecificYear(newYearClicked, newYearRange, startYear, endYear, "start")))
                setEndTime(formatString(calculateSpecificYear(newYearClicked, newYearRange, startYear, endYear, "end")))
            }
            else {
                setSpecificTimeline(false)
                setYearClicked()
                setStartTime(formatString(startYear))
                setEndTime(formatString(endYear))
            }
        };

        // determines wherher or not to display arrows - if any more times can be displayed on timeline, or reached start/ end
        if((zoomLevel == 1 || displayStartCount == 0) && startYear == TIMELINE_START) {
            isLeftArrHidden = true
        }
        if((zoomLevel == 1 || (displayStartCount + 1) == 2* (zoomLevel - 1)) && endYear == TIMELINE_END) {
            isRightArrHidden = true
        }

        // push buttons into array
        buttons.push(generateButton("leftArrow", LEFT_ARROW, () => handleArrowClick('left'), false, true, isLeftArrHidden, "Go to previous time period"));
        if (startYear !== "") {
            buttons.push(generateYearButtons());
        }
        buttons.push(generateButton("rightArrow", RIGHT_ARROW, () => handleArrowClick('right'), false, true, isRightArrHidden, "Go to next time period"));

        // returns timeline buttons
        return (
            <Fragment>
                <div key= "timelineButtons" className={styles["period-container"]}>
                    {buttons}
                </div>
                <div className={styles["cards-toolkit"]}>
                    <Search 
                        data = {props.data} setSearchDisplayData={props.setSearchDisplayData} setIsSearchData = {props.setIsSearchData}
                        fontSize={fontSize} charSpacing={charSpacing} 
                        interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing}  ></Search>
                    <Fragment>{zoomButtonPopulator()}</Fragment>
                </div>
            </Fragment>
        );
    }

    // return time interval
    return (
        <div className={styles["interval-container"]}>
            {yearButtonPopulator()}
        </div>
    );
}