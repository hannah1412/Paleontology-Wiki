"use client";

import React,  {useEffect} from "react";
import styles from "../Styles/BodyPeriodHeader.module.css";
import periodsAndTimes from './PeriodsAndTimes.json';
import {fontStyles} from '../TimelinePage.js';
import {useSelector } from 'react-redux';

/**
 * function to return timeline headers (names of periods and zoomed in time ranges (in years))
 * @param {*} props properties
 * @returns timeline time headers
 */
export default function BodyPeriodHeader(props) {
    const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);

    const {
        setPeriod, period, 
        setStartYear, startYear, 
        setEndYear, endYear,
        setTimeRange, setDisplayStartCount, fontSize, charSpacing, lineSpacing, interWordSpacing
    } = props
    const buttonStyles = fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing);

    /**
     * creates buttons
     * @param {Object} props properties
     * @returns button
     */
    function Button(props) {
        return (
            <button style={buttonStyles} className={`${styles["button-period"]} ${props.className}`} onClick={props.onClick}>{props.value}</button>
        );
    }

    /**
     * changes states depending on buttons pressed
     */
    const pressedHandler = (periodName, start, end) => {
        setPeriod(periodName);
        setStartYear(start);
        setEndYear(end);
        setDisplayStartCount(0)
    };


    /**
     * calculates the time range (in millions of years)
     * @param {int} start start year of period
     * @param {int} end  end year of period
     */
    const calculateTimeRange = (start, end) => {
        let startT = Number(start)
        let endT = Number(end)
        let range = startT - endT;
        if (startT < endT) {
            range = endT - startT
        }
        setTimeRange(range);
    }

    /**
     * re-renders component and sets new time range every time start or end year changes
     */
    useEffect(() => {
        calculateTimeRange(startYear, endYear);
    }, [startYear, endYear]);


    // return names of periods in buttons
    return (
        <div className={styles["period-container"]}>
            {periodsAndTimes.map(({ name, start, end }) => (
                <Button key={name} value={name} className={`${(period !== name && period !== "") ? styles['blur'] : ''}` + ` ${(reduceMotion) ? styles["reduce"] : ""}`}
                    onClick={() => { pressedHandler(name, start, end) }}/>
            ))}
        </div>

    );
} 