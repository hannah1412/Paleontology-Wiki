'use client';

import { React, useState, useEffect, Fragment } from "react";
import LeafletMap from "./LeafletMap";
import InformationPanel from "./InformationPanel";
import MapWidget from "./MapWidget";
import styles from "./CSS/MapPage.modules.css";
import Footer from "@/components/UI/Footer";

import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CustomSlider from "./CustomSlider";



// URL for our backend api.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_ADDR + "/map"

/**
 * Takes in data of all countries in the world and stores their data in an array of country objects.
 * @param {*} data json data fetched from backend
 * @returns array of Country objects.
 */
function parseCountries(data) {
	let countryData = [];

	data.map((record) => {
		// Gets id number from URL.
		let idNum = record.country.value.split("/")[record.country.value.split("/").length - 1];
		// Coordinates 
		let coordinates = record.countryPosition.value.match(/-?\d+.\d+/g);
		// Flag
		let flagImg = record.flagImage.value;

		// Object storing data about each country.
		const country = {
			id: idNum,
			name: record.countryName.value,
			coordinatesArr: [parseFloat(coordinates[1]), parseFloat(coordinates[0])],
			flag: flagImg,
			fossilCount: 0
		}

		countryData.push(country);
	})
	return countryData;
}


/**
 * Displays HTML and graphics for project.
 * @returns 
 */
function MapPage() {

	// Creates an initial state for the data.
	const [data, setData] = useState(null);

	// Creates an initial country state to track current country being displayed.
	const [country, setCountry] = useState(null);

	// Creates an initial discovery location state to track current country being displayed.
	const [discoveryLocation, setDiscoveryLocation] = useState(null);

	// Async fetch for initial countries of the world.
	useEffect(() => {
		fetch(BACKEND_URL + '/countries')
			.then((response) => {
				if (response.status == 400) {
					console.log(response.body);
					return "{}";
				} else {
					return response.json();
				}

			})
			// Parses and sets the data state as the retrieved data.
			.then((data) => {
				setData(parseCountries(data));

			})
			.catch((err) => console.log(err))
	}, []);

	// HTML for page - map and then information panel, uses function components. Uses states as props to track and update them in child pages.
	// classNames used to apply CSS from .module.css pages.

	// Tracks hidden state for information panel.
	const [isHidden, setHidden] = useState(false); 

	//Tracks font size of the information panel
	const [userFontSize, setUserFontSize] = useState(16); 

	//Tracks the state of the map pop-up window
	const [expandedMap, setMapExpandWidget] = useState(null);

	return (
		<Fragment>

			<div className='outer'>

				<button className={isHidden ? "show" : "hide"} onClick={() => setHidden(!isHidden)}>{!isHidden ? "Hide" : "Show"}</button>
				<div className='mapArea'>
					<LeafletMap hidden={isHidden} data={data} setCountry={(c) => setCountry(c)} setDiscoveryLocation={(dl) => setDiscoveryLocation(dl)} />
				</div>



				<div className={!isHidden ? "summary" : "summary_hidden"}>
					<CustomSlider onChange={setUserFontSize} />
					<div style={{ fontSize: userFontSize / 10 + "rem", letterSpacing: "0.05em", wordSpacing: "0.175em" }}>
						<InformationPanel country={country} discoveryLocation={discoveryLocation} mapWidget={setMapExpandWidget} />
					</div>
				</div>

				{expandedMap && (
					<div className="expandedWidget">
						<main className="wrapper">
							<div className="expand">
								<FontAwesomeIcon className="wrapper-button" icon={faCircleXmark} onClick={() => setMapExpandWidget(null)} />
								<h1 className="title">All Locations Of Discovery</h1>

								<div className="mapWidgetPopUp">
									<MapWidget fossilID={expandedMap}></MapWidget>
								</div>
							</div>
						</main>

					</div>
				)}

			</div>


			<Footer />



		</Fragment>)
}

export default MapPage;
