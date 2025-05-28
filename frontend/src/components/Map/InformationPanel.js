import { React, useState } from "react";
import styles from "./CSS/InformationPanel.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeHigh, faMapLocationDot, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link';

/**
 * Creates a single div containing all of the cards for a list of fossils.
 * @param {*} fossils as json objects
 * @param {*} mapWidget function to create widget from fossil id
 * @returns 
 */
function createCards(fossils, mapWidget) {
    const cardsArray = []; // Stores card HTML.
    const synth = window.speechSynthesis;

    // Create array of cards, card per fossil.
    for (let index = 0; index < fossils.length; index++) {
        // Reads the name of a fossil.
        const textToSpeech = new SpeechSynthesisUtterance(fossils[index].fossilLabel);

        cardsArray.push(
            <div className={styles["card"]} >
                <img className={styles["cardImages"]} src={fossils[index].image} onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = "img/imageNotFound.png";
                }} />
                <div className={styles["cardText"]}>
                    <div className={styles["title_container"]}>
                        <h2 >{fossils[index].fossilLabel}</h2>
                        <FontAwesomeIcon className={styles["audio_icon"]} icon={faVolumeHigh} onClick={() => synth.speak(textToSpeech)} />
                    </div>
                    <b>WikiData Id: {fossils[index].fossilId}</b>
                    <p>{capitalise(fossils[index].description)}.</p>
                    <FontAwesomeIcon className={styles["location_icon"]} icon={faMapLocationDot} onClick={() => mapWidget(fossils[index].fossilId)} />

                    <Link href={{
                        pathname: '/result', query: {
                            id: fossils[index].fossilId,
                        },
                    }}><FontAwesomeIcon className={styles["search_icon"]} icon={faMagnifyingGlass} /></Link>

                </div>
            </div>);
    }
    return <div>{cardsArray}</div>;
}

/**
 * Capitalises first character in string.
 * @param {*} str Text description
 * @returns Capitalised text
 */
function capitalise(str) {
    if (str != null) str = (str).charAt(0).toUpperCase() + (str).slice(1);
    return str;
}

/**
 * Capitalises first letter of every word in string.
 * @param {*} str Text
 * @returns Capitalised text
 */
function capitaliseAll(str) {
    if (str != null) {
        str = str.split(" ");
        let string = "";
        for (let index = 0; index < str.length; index++) {
            string += capitalise(str[index]) + " ";
        }
        return string;
    }
}

/**
 * Plays associated audio file of country name
 * @param {*} countryName Country name
 */
function playSound(countryName) {

    try {
        //Our recorded text-to-speech
        const audio = new Audio("audio/" + countryName + ".mp3");
        audio.type = "audio/mp3";
        audio.play()
    } catch (err) {
        //If no soud file, use text-to-speech
        const synth = window.speechSynthesis;
        const textToSpeech = new SpeechSynthesisUtterance(countryName);
        synth.speak(textToSpeech)
    }
}

/**
 * Ensures that HTML tags are only displayed if the information attribute is present.
 * @param {*} attribute fetched from backend.
 * @param {*} html Correct HTML if attribute is present.
 * @param {*} altHTML Alternate HTML if attribute is not present.
 * @returns HTML to be displayed.
 */
function checkNull(attribute, html, altHTML) {
    if (attribute != null && attribute[0] != null) return html;
    return altHTML;
}

// Function component for the Information Panel.
// country and discoveryLocation are state objects that update the current icon selections in real time.
const InformationPanel = ({ country, discoveryLocation, mapWidget }) => {

    // NO INFORMATION //
    if (country == null && discoveryLocation == null) {
        // Displays if no data or discovery location has been recieved.
        return (
        <div className={styles["Information"]}> 
            <div className={styles["noInfo"]}><h1>No Icon Selected</h1><p>Click on a country icon, or use the search bar to display the discovery locations of fossils.</p></div>
        </div>) 

    
    // DISCOVERY LOCATION //
    } else if (country == null && discoveryLocation != null) { 
        
        const synth = window.speechSynthesis;
        const textToSpeech = new SpeechSynthesisUtterance(discoveryLocation.name);

        // Discovery location information should be displayed.
        const fossils = discoveryLocation.fossils

        // List of fossils at discovery location in HTML form.
        const listFossils = createCards(fossils, mapWidget);

        return (
        <div className={styles["Information"]}>
            <div className={styles["title_container"]}>
                <h1>{discoveryLocation.name}</h1>
                <FontAwesomeIcon className={styles["audio_icon"]} icon={faVolumeHigh} onClick={() => synth.speak(textToSpeech)} />
            </div>
            {checkNull(discoveryLocation.id, <b>WikiData Id: {discoveryLocation.id}</b>)}
            <p>{capitalise(discoveryLocation.description)}.</p>
            <h3>Fossils at this location: {fossils.length}</h3>
            {listFossils} 
        </div>)


    // COUNTRY //
    } else {
        // checkNull() only outputs category if there is data for it, prevents outputting titles with no data.
        // E.g. title_container is only added to the panel if country.name is not null.
        return (
        <div className={styles["Information"]}>
            {checkNull(country.name, <div className={styles["title_container"]}> 
                <h1>{country.name}</h1>
                <FontAwesomeIcon className={styles["audio_icon"]} icon={faVolumeHigh} onClick={() => playSound(country.name)} />
            </div>)}
            {checkNull(country.flag, <div><img src={country.flag} className={styles["flag"]}></img><br></br></div>)}
            {checkNull(country.id, <p><b>WikiData Id: {country.id}</b></p>)}
            {checkNull(country.description, <p>{capitalise(country.description)}.</p>)}
            <table className="infoTable">
                <tbody>
                    <tr>
                    <th className="categories" key="tableheader"> 
                        {checkNull(country.continent, <p>Continent:</p>)}
                        {checkNull(country.capital, <p>Capital City:</p>)}
                        {checkNull(country.population, <p>Population:</p>)}
                        {checkNull(country.currency, <p>Currency:</p>)}
                        {checkNull(country.area, <p>Area:</p>)}
                    </th>
                    <td key="tabledata">
                        {checkNull(country.continent, <p>{country.continent}</p>)}
                        {checkNull(country.capital, <p>{country.capital}</p>)}
                        {checkNull(country.population, <p>{country.population}</p>)}
                        {checkNull(country.currency, <p>{capitaliseAll(country.currency)}</p>)}
                        {checkNull(country.area, <p>{country.area} km<sup>2</sup></p>)}
                    </td>   
                    </tr>
                </tbody>
            </table>
            {checkNull(country.coordinatesArr, <b>{country.coordinatesArr[0]}°N, {country.coordinatesArr[1]}°W</b>)}
        </div>);
    }
};
export default InformationPanel;