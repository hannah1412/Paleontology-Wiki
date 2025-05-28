// Inspiration taken from Tree/Visualisation/InformationCard/InformationCard.js
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faCog } from "@fortawesome/free-solid-svg-icons";

import styles from "../../Styles/SettingsPanel.module.css";
import {useSelector } from 'react-redux';
import {fontStyles} from '../../TimelinePage.js';

/**
 * information card to see current settings 
 * @param {Object} props properties 
 * @returns information card with current settings of filter buttons provided
 */
export default function SettingsPanel (props) {
	const [show, setShow] = useState(false);
	const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
	const {fontSize, charSpacing, lineSpacing, interWordSpacing} = props

	// changes settings display
	let histroModeDisplay = "";
	if (!props.histroMode) {
		histroModeDisplay = "Cards Display"
	}
	else {
		histroModeDisplay = "Histropedia Display"
	}

	// returns information card
	return (
		<section tabIndex={0} className={`${styles.card} ${styles.animate_card} ${styles.animate_appearance} ${!show ? styles.hide : ""}` + ` ${(reduceMotion) ? styles["reduce"] : ""}`}>
			<button className={styles.toggle_button} onClick={() => {setShow(!show)}}>
				<FontAwesomeIcon icon={faArrowUp} className={`${styles.toggle_icon} ${!show ? "" : styles.flip}`}/>
				{!show ? "Show" : "Hide"}
				<FontAwesomeIcon icon={faCog} className={`${styles.toggle_icon} ${!show ? "" : styles.flip}`}/>
			</button>

			<ul style={fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing)} className={styles.parent_list}>
				<li className={styles.list_item}><b>Number of Cards:</b> {props.numToFetch}</li>
				<li className={styles.list_item}><b>Type of Taxon: </b>{props.rank}</li>
				<li className={styles.list_item}><b>Popularity Sort: </b>{props.popularity}</li>
			</ul>
		</section>
	);
};