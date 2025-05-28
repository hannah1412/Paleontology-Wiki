'use client';

import styles from "../Styles/Search.module.css";
import React, { useRef, useEffect, useState } from "react";
import {fontStyles, DEFAULT_LINE_SPACE_SIZE} from '../TimelinePage.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faArrowsRotate} from "@fortawesome/free-solid-svg-icons";

const BIN_ICON = <FontAwesomeIcon icon={faTrashCan} style={{fontSize: '2rem'}} />
const REFRESH_ICON= <FontAwesomeIcon icon={faArrowsRotate} style={{fontSize: '2rem'}} />

/**
 * ranks list of searches in order of similarity with searched word
 * @param {string} word word being searched
 * @param {Array<string>} allData list of all data
 * @returns list of top 5 searches
 */
function bestMatches(word, allData) {
    const bigramSet = calculateBigrams(word);
    const correctedWords = [];

    // Calculate coefficients for each word in the dictionary
    for (let count = 0; count < allData.length; count++) {
        let searchCoefficient = 0
        const dictionaryBigramSet = calculateBigrams(allData[count]);
        const sorensenDiceCoefficient = calculateCoefficient(bigramSet, dictionaryBigramSet);

        // adds 1 (to rank highest) if searched word starts with word being checked against
        if (allData[count].startsWith(word)) {
            searchCoefficient = sorensenDiceCoefficient + 1
        }
        else {
            searchCoefficient = sorensenDiceCoefficient
        }

        correctedWords.push({ word: allData[count], coefficient: searchCoefficient });
    }

    // sorts the words
    correctedWords.sort((a, b) => b.coefficient - a.coefficient);
    let orderedWords = correctedWords.map(item =>  capitaliseFirstLetter(item.word));

    // only slices if enough searches
    if (orderedWords.length > 5) {
        return orderedWords.slice(0,5)
    }
    return orderedWords;
}

/**
 * creates list of bigrams from word being searched
 * @param {string} word word being searched 
 * @returns list of bigrams from word being searched
 */
function calculateBigrams(word) {
    const bigramSet = new Set();

    if (word.length === 1) {
        bigramSet.add(`^${word}`);
        bigramSet.add(`${word}$`);

    } else if (word.length === 0) {
        bigramSet.add("^$");

    } else {
        for (let count = 0; count < word.length; count++) {
            let bigram = "";

            if (count === 0) {
                bigram = `^${word[count]}`;
            } else if (count === word.length - 1) {
                bigram = `${word[count]}$`;
            } else {
                bigram = `${word[count]}${word[count + 1]}`;
            }
            bigramSet.add(bigram);
        }
    }
    return bigramSet;
}

/**
 * calculates coefficient of word using soersen coefficiency 
 * @param {Array<String>} inputBigrams bigrams of searched word
 * @param {Array<String>} allDataBigrams bigrams of data searched word  
 * @returns 
 */
function calculateCoefficient(inputBigrams, allDataBigrams) {
    const inputSetSize = inputBigrams.size;
    const dictionarySetSize = allDataBigrams.size;

    const intersectionSet = new Set([...inputBigrams].filter(x => allDataBigrams.has(x)));
    const intersectionSetSize = intersectionSet.size;
    const coefficientResult = (2 * intersectionSetSize) / (inputSetSize + dictionarySetSize);
    return coefficientResult;
}

/**
 * capitalises first letter of word
 * @param {string} word word to format
 * @returns capitalised word
 */
function capitaliseFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * search component
 * @param {Object} props properties
 * @returns Search components
 */
export default function Search(props) {
    const [filter, setFilter] = useState('');
    const [searchLength, setSearchLength] = useState(0);
    const searchInputRef = useRef(null);

    const {fontSize, charSpacing, lineSpacing, interWordSpacing, setSearchDisplayData, data, setIsSearchData} = props
    const elements = [];
    const buttonStyles = fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing);
    let dataArray = Object.values(data);

    // updates based on searched word length
    useEffect(() => {
	}, [searchLength]);

    // populates the search buttons
    const searchPopulator = () => {
        // returns the suggested searches 
        function suggestedSearchFinder() {
            const labelArray = dataArray.map(item => item.label.toLowerCase())
            const orderedWords = bestMatches(filter.toLowerCase(), labelArray)
            return orderedWords
        }

        // changes values based on what option is clicked
        const pressedHandler = (label) => {
            const filteredData = Object.values(data).filter(item => item.label === label);
            setSearchDisplayData(filteredData)
            setIsSearchData(true)
            searchInputRef.current.value = '';
            setSearchLength(0)
        };
        const suggestedWords = suggestedSearchFinder()      

        // returns search container 
        return (
            searchLength > 0 && 
            <div style={buttonStyles}
                className={suggestedWords.length > 0 ? styles["button-container"] : styles["button-container-hide"]}>

                {suggestedWords.map((option, index) => (
                    <button key={index} className={styles["search-buttons"]} onClick={() => pressedHandler(option)}>
                        {option} 
                    </button> 
                ))}
            </div>
        );
    };

    // format search options
    for (let index = 0; index < dataArray.length; index++) {
        const item = dataArray[index];
        elements.push(
            <button className={styles["search-buttons"]}>
                {item.label}
            </button>
        )
    }

    /**
     * handles filter input
     * @param {*} event value inputted in input box 
     */
    const handleFilterChange = (event) => {
        let filterVal = event.target.value
        setFilter(filterVal);
        setSearchLength(event.target.value.length);
    }

    /**
     * clears search bar
     */
    const clearSearchHandler = () => {
        searchInputRef.current.value = '';
        setSearchLength(0)
    };

    /**
     * resets the specified search
     */
    const resetHandler = () => {
        setIsSearchData(false)
        searchInputRef.current.value = '';
        setSearchLength(0)
    };

    // returns seach bar component
    return (
        <div className={styles["container"]}>
            <div className={styles["search-container"]}>
                    <input aria-label="Search through cards currently displayed" style={fontStyles(fontSize, charSpacing, interWordSpacing, DEFAULT_LINE_SPACE_SIZE)} className={styles["search"]}
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search..."
                        onChange={handleFilterChange}
                    />
                {searchPopulator()}
            </div>
            <button aria-label="Clear search" className={styles["clear-search"]} onClick={clearSearchHandler}>{BIN_ICON}</button>
            <button aria-label="Reset search" className={styles["reset-search"]} 
                    onClick={resetHandler}
                    style={fontStyles(fontSize, charSpacing, interWordSpacing, 0)} >{REFRESH_ICON}</button>
        </div>
    );
}
