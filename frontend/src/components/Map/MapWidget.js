'use client';

import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { useState, useEffect, useContext, useRef, React, Fragment } from "react";
import styles from "./CSS/MapWidget.module.css"
import InformationPanelWidget from "./InformationPanelWidget";
import L from "leaflet";
import { BACKEND_URL } from "./MapPage";
import { ThemeContext } from "@/store/ThemeContextProvider";

// Fossil icon attributes
var FossilIcon = L.Icon.extend({
    options: {
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, 0]
    }
});

/**
 * Takes a fossil Q id and fetches all the locations it was discovered
 * @param {*} id A wikidata QID
 * @param {*} map The map element
 */
function fetchLocations(id, map, setParams, setHasMarker) {

    // Sends query to our API to fetch fossil location from wiki data.
    fetch(BACKEND_URL + '/fossilLocation?fossil=' + id)
        .then((response) => {
            if (response.status == 400) { // Bad request error.
                return null;
            } else {
                // Parses query data to json
                return response.json();
            }

        }) //Parses and plots the locations.
        .then((data) => {
            let locations = parseFossilLocations(data);
            if (locations.length != 0) {
                if (map != null) plotLocations(locations, map, setParams)
                setHasMarker(true)
            }
        })
        .catch((err) => console.log(err))
}


/**
 * Takes the locations data and parses it.
 * @param {*} data The unparsed locations data
 */
function parseFossilLocations(data) {

    //The parsed location
    let locations = [];

    data.map((record) => {
        let coordinates = record.coordinates.value.match(/-?\d+.\d+/g);

        // Object that represents information that can be displayed about a location.
        const fossilLocation = {
            coordinatesArr: [parseFloat(coordinates[1]), parseFloat(coordinates[0])],
            discoveryLocation: record.discoveryLocationLabel.value,
            country: record.countryLabel.value,
            continent: record.continentLabel.value,
        }

        locations.push(fossilLocation);
    })

    return locations;
}
/**
 * Plots all locations a fossil was discovered in
 * @param {*} locations The list of discovery locations
 * @param {*} map The map element
 */
function plotLocations(locations, map, setParams) {

    //Iterates through all locations and plotting them
    locations.map((location) => {
        plotLocation(location, map, setParams)
    })

}

/**
 * Plots a location onto the map
 * @param {*} location A location a fossil was discovered
 * @param {*} map The map element
 */
function plotLocation(location, map, setParams) {

    //Information for the pop up window
    let discoveryLocation = location.discoveryLocation;
    let country = location.country
    let continent = location.continent
    let fossilArr = [discoveryLocation, country, continent]


    //Marker that represents the location on the map
    let iconImg = new FossilIcon({ iconUrl: 'img/fossilIcon.png' });
    let coordinates = location.coordinatesArr;
    let marker = L.marker(coordinates, { icon: iconImg })

    // Adds marker to map and hover functionality.
    marker.addTo(map)
        .on("mouseover", function (event) {
            setParams(fossilArr);
        })
        .on("mouseout", function (event) {
            setParams(null);
        })
}



// Function component for the Map.
const MapWidget = ({ fossilID }) => {

    const [hasMarker, setHasMarker] = useState(false);
    const { theme } = useContext(ThemeContext);

    // Array of parameters for widget information panel
    const [fossilParams, setParams] = useState(null);

    // Creates a persistent value for the map.
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // effect for plotting map, will update with data
    // state to hold map, will do next effect if this is not null

    useEffect(() => {

        if (!mapContainerRef.current) return;
        // Check if a map instance already exists
        if (mapInstanceRef.current) {
            // If it exists, remove it and create a new one
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Sets boundaries for the map.
        let southWest = L.latLng(-90, -190);
        let northEast = L.latLng(90, 190);
        let bounds = L.latLngBounds(southWest, northEast);

        // Map starts centred at slightly zoomed. 
        const map = L.map(mapContainerRef.current, {
            maxZoom: 12,
            minZoom: 1.25,
            maxBounds: bounds,
            maxBoundsViscosity: 1,
            zoomControl: false
        }).setView([0,0], 1)

        //Allows the map to properly be resized
        const mapDiv = document.getElementById("mapWidgetContainer")
        const resizeObserver = new ResizeObserver(() => {

            try {
                map.invalidateSize();
            } catch (error) {
                console.log("Resizing too fast")
            }

        });
        resizeObserver.observe(mapDiv)

        L.control.zoom({
            position: 'bottomright',
        }).addTo(map);

        // Base map layer is an empty map.
        L.tileLayer('http://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map);

        mapInstanceRef.current = map;

        // Plots the discovery locations of a fossil on the map.
        if (fossilID != null) {
            fetchLocations(fossilID, map, setParams, setHasMarker)
        }

    }, [fossilID, hasMarker]);


    // Returns the map widget
    return (
        <Fragment>
        {fetchLocations(fossilID, null, setParams, setHasMarker)}
        <div className={styles["widget"]} id="mapWidgetContainer">
            <InformationPanelWidget hasMarker={hasMarker} fossilParams={fossilParams} />
            {hasMarker && <div className={styles["map"]} ref={mapContainerRef}></div>}
        </div>
        </Fragment>
    );
};
export default MapWidget;