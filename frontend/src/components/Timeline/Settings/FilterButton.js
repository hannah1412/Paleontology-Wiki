"use client";

import React,  {useState, useEffect} from "react";
import styles from "../Styles/FilterButton.module.css";
import {fontStyles} from '../TimelinePage.js';
import {useSelector } from 'react-redux';

const timeOptions = [10, 20, 50, 100, 200]; 
const ranks = ["species", "genus", "family", "order", "class", "phylum", "kingdom", "domain", "none"]
const populairtyPriority = ["highest", "lowest"]

/**
 * filters the number of entries
 * @param {*} props Controls the number of cards displayed.
 * @returns Filter Button components
 */
export default function FilterButton(props) {
    const [showDropdown, setShowDropdown] = useState(false);
    const {fontSize, charSpacing, lineSpacing, interWordSpacing, value} = props
    const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
    
    // changes the options to display
    let options = []; 
    if (props.id == "numCards") {
        options = timeOptions;
    }
    else if (props.id == "taxonType") {
        options = ranks;
    }
    else if (props.id == "popularity") {
        options = populairtyPriority;
    }

    useEffect(() => {}, [props.filterOn]); 

    /**
     * changes states depending on buttons pressed
     */
    const pressedHandler = (filterVal) => {
        props.setFilterVal(filterVal);
        setShowDropdown(!showDropdown);
        props.setFilterOn(true)
    };

    /**
     * changes state of whether button dropdown is displayed or not
     */
    const toggleDropdown = () => {
        if (props.filterOn && !showDropdown) {
            setShowDropdown(true);
            props.setFilterOn(false)

        }
        if (!props.filterOn && showDropdown) {
            setShowDropdown(false);
            props.setFilterOn(true)
        }
    }

    // creates filter dropdown
    return (
        <div className={styles["dropdown"] }>
            <button 
                style={fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing)}
                className={styles["button-toggle"]+ ` ${(showDropdown) ? styles["show"] : ""}` + ` ${(reduceMotion) ? styles["reduce"] : ""}`} 
                onClick={toggleDropdown}>{value}
            </button>

            <div className={styles["dropdown-content"]+ ` ${(showDropdown) ? styles["show"] : ""}`}>
                {/* maps all possible options to buttons */}
                {options.map((option, index) => (
                <button key={index} 
                    style={fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing)} 
                    onClick ={props.working ? () => {pressedHandler(option)} : () => {alert("Work in Progress (PoC)")}}
                    className={`${styles["buttons"]}`} >
                        {option}
                </button> ))}
            </div>
        </div>
    );
}