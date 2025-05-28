"use client";

import React,  {useState} from "react";
import stylesCard from "../Styles/Card.module.css";
import stylesCardSpace from "../Styles/CardSpace.module.css";
import HistoryBox from "./HistoryBox";
import {fontStyles} from '../TimelinePage.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { deformatString } from "./HistroFunctions";

const IMG_NOT_FOUND = "img/imageNotFound.png"
const HEADING_MULTIPLIER = 1.2
const AUDIO = <FontAwesomeIcon icon={faVolumeHigh}style={{fontSize: '1.5rem'}} />
const SEARCH = <FontAwesomeIcon icon={faMagnifyingGlass}style={{fontSize: '1.5rem'}} />

/**
 * Creates the space for item cards
 * @param {*} props contains information on the taxons whose values will be
 *  loaded into the item cards
 * @returns responive container of cards 
 */
export default function CardSpace(props) {
    const dataArray = Object.values(props.data);
    const elements = []; 

    const {fontSize, charSpacing, lineSpacing, interWordSpacing} = props
    const buttonStyles = fontStyles(fontSize*HEADING_MULTIPLIER, charSpacing, interWordSpacing, lineSpacing);
    const buttonLargerStyles = fontStyles(fontSize*HEADING_MULTIPLIER*HEADING_MULTIPLIER, charSpacing, interWordSpacing, lineSpacing);

    // When card is selected, Summary Box component receives selectedItemData, onClose.
    const [selectedItemData, setSelectedItemData] = useState(null)

    // handles audio being played
    const handleAudioClick = (event, index) => {
        event.stopPropagation();
        const itemData = dataArray[index];
        const start = deformatString(itemData.startTime)
        const end = deformatString(itemData.endTime)
        setSelectedItemData(null)
        speak(itemData.label + ": lived from " + start + "and lived to " + end);
    }

    // handles the click of the card
    const handleClick = (index) => {
        const itemData = dataArray[index];
        const start = deformatString(itemData.startTime)
        const end = deformatString(itemData.endTime)

        setTimeout(function() {
            setSelectedItemData([itemData, start, end])
        }, 200)
    }

    // speaks text provided
    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    };

    // closes the pop up
    const handleCloseHistoryBox = () => {
        setSelectedItemData(null);
    }    

    // opens pop up if card is clicked
    function handleKeyDown(event, index) {
        if (event.key === 'Enter') {
            handleClick(index);
        }
    }

    // closes history box on enter
    function handleKeyDownClose(event) {
        if (event.key === 'Enter') {
            handleCloseHistoryBox()
        }
    }

    // Create n many cards based on props.data with styling
    for (let index = 0; index<dataArray.length; index++) {
        const item = dataArray[index];
        const startTime = deformatString(item.startTime)
        const endTime = deformatString(item.endTime)

        // chooses wikiData image or placeholder if not found
        item.imgURL = (item.imgURL != null ? item.imgURL : IMG_NOT_FOUND)
        
        // pushes the elements (cards) into an array 
        elements.push(
            <div className={stylesCard["container"]} key={index}>
                <div className={stylesCard["small-container"]} onClick={() => handleClick(index)} onKeyDown={(event) => handleKeyDown(event, index)}>
                    <div tabIndex={0}  onKeyDown={(event) => handleKeyDown(event, index)} className={stylesCard["imageContainer"]}>
                        <img src={item.imgURL} alt={item.label}/>
                    </div>

                    <div className={stylesCard.textContainer}>
                        <h3 style={fontStyles(fontSize*HEADING_MULTIPLIER, charSpacing, interWordSpacing, lineSpacing)}>{item.label}
                        <button
                            aria-label="Read out taxon information"
                            className= {stylesCard["audio"]}
                            onClick={(event) => handleAudioClick(event, index)}
                            onKeyDown={(event) => handleKeyDownClose(event)}
                        >{AUDIO}</button>
                        <Link aria-label="View article page" onClick={handleCloseHistoryBox} className={stylesCard.link} href={{pathname: '/result', query: {id: item.id}}}>{SEARCH}</Link>
                        </h3>
                        <p><b style={buttonStyles}>Start: </b>{startTime}</p>
                        <p><b style={buttonStyles}>End:  </b>{endTime}</p>
                    </div>  

                </div>
            </div>
        )
    }
    

    // Return CardSpace div with card elements
    return (
        <div className={stylesCardSpace.parentContainer}>
            {Array.isArray(props.data) ? (
                <div className={stylesCardSpace.container}>
                    {elements}
                    {selectedItemData!=null && (
                        <HistoryBox item={selectedItemData} onClose={handleCloseHistoryBox} />
                    )}                
                </div>
            ) : (
                <h2 className={stylesCardSpace.loading}>Loading</h2>
            )}
        </div>
    );
}
