"use client";

import React, { Fragment, useEffect, useState } from "react";
import styles from "./CSS/SearchBar.module.css";


const SearchBar = ({data, fetchCountryInfo, setCountry, setCoords, setZoom, setZoomThreshold, zoomThreshold}) => {
    const [inputText, setInputText] = useState("");
    const [tempThreshold, setTempThreshold] = useState(zoomThreshold);


    // Refreshes the search bar component    
    useEffect(() => { setTempThreshold(zoomThreshold) }, [zoomThreshold]);
    // Refreshes the leaflet map component 
    useEffect(() => { setZoomThreshold(tempThreshold) }, [tempThreshold])


    /**
     * Handler for when user selects a searched country
     * @param {*} country - Object of country information
     */
    function handleClick(country) {
        setInputText(""); // Clear search box
        
        if (tempThreshold % 2 == 0) setTempThreshold(prevThreshold => prevThreshold + 1); // If even before, set to odd
        else setTempThreshold(prevThreshold => prevThreshold + 2); // Else remain odd
        // Changing tempThreshold will update the zoomThreshold of the map
            
        setCoords(country.coordinatesArr); // Center map on country
        setZoom(4); // Zoom in

        // Set information panel to search country
        fetchCountryInfo(country, setCountry);
    }


    /**
     * Filters the user's input and generates a list of potential matches
     * @param {*} input The user's input
     * @param {*} data A list of country names
     * @returns An unordered list of countries which satisfy the filter
     */
    function list(input, data) {
        const filteredData = data.filter((el) => {
            if (input === "") {
                return null;
            } else {
                return el.name.toLowerCase().includes(input)
            }
        })


        return (
            <Fragment>
            {filteredData.length > 0 &&
                <div className={styles["searchList"]}>
                    {filteredData.slice(0, 10).map((country) => ( // Top 10 matches limit
                        <button 
                            key={country.name} 
                            className={styles["searchButton"]} 
                            onClick={() => handleClick(country)}>
                            {country.name}
                        </button>
                    ))}
                </div>}
            </Fragment>

        )
    }


    /**
     * Converts input to lower case as it is being entered
     * @param {*} e Current element inspected 
     */
    let inputHandler = (e) => {
        var lowerCase = e.target.value.toLowerCase();
        setInputText(lowerCase);
    };


    return (
        <div className={styles["searchbar"]}>
                <input className={styles["search"]}
                    onChange={inputHandler}
                    value={inputText}
                    placeholder="Search Country.."
                />
            {list(inputText, data)}
        </div>
    );
}

export default SearchBar;