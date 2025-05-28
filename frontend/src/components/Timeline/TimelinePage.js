'use client';

import React,  {useState, Fragment} from "react";
import stylesMain from "./Styles/TimelinePage.module.css";
import stylesBody from "./Styles/Body.module.css";
import Footer from "@/components/UI/Footer";

import Body from "./Body.js"
import FilterButtons from './Settings/FilterButton.js'
import ModeToggle from "./Settings/ModeToggle.js"
import SettingsPanel from "./Settings/SupergroupCode/SettingsPanel.js";
import FontSizeSelector from './Accessibility/SizeSelector.js'

const DEFAULT_NUM_TO_FETCH = 100

export const SIZE_LINE_DIVIDER = 10;
const CHAR_LINE_SPACE_DIVIDER = 100;
export const DEFAULT_FONT_SIZE = 10;
export const DEFAULT_CHAR_SPACE_SIZE = 5;
export const DEFAULT_INTER_WORD_SPACE_SIZE = 35;
export const DEFAULT_LINE_SPACE_SIZE = 15;

/**
 * font styles for accessibility changer
 * @param {int} fontSize font size in px
 * @param {int} charSpacing character spacing multiplier
 * @param {int} interWordSpacing inter word spacing multiplier
 * @param {int} lineSpacing line spacing multiplier
 * @returns font styles depending on accessibility
 */
export const fontStyles = (fontSize, charSpacing, interWordSpacing, lineSpacing) => {
	fontSize = (fontSize/SIZE_LINE_DIVIDER)
	charSpacing = (charSpacing/CHAR_LINE_SPACE_DIVIDER);
	interWordSpacing = (interWordSpacing/SIZE_LINE_DIVIDER) * charSpacing;
	lineSpacing = lineSpacing/SIZE_LINE_DIVIDER * interWordSpacing;

    return {
		fontSize: `${fontSize}em`,
        letterSpacing: `${charSpacing}em`,
		wordSpacing: `${interWordSpacing}em`,
		lineHeight: `${lineSpacing}em`
    };
};


/**
 * Timeline page
 * @returns timeline page component
 */
export default function TimelinePage() {
	const [numToFetch, setNumToFetch] = useState(DEFAULT_NUM_TO_FETCH);
	const [rank, setRank] = useState('none');
	const [popularity, setPopularity] = useState('highest');
	const [filterOn, setFilterOn] = useState(true)
	const [histroMode, setHistroMode] = useState(false) // False for card timeline mode, true for HistroPedia timeline mode

	// Accessibility states
	const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE); 
	const [charSpacing, setCharSpacing] = useState(DEFAULT_CHAR_SPACE_SIZE); 
	const [interWordSpacing, setInterWordSpacing] = useState(DEFAULT_INTER_WORD_SPACE_SIZE); 
	const [lineSpacing, setLineSpacing] = useState(DEFAULT_LINE_SPACE_SIZE); 


	return (
		<Fragment>
			<div className = {stylesMain["main"]}>
				<div className = {stylesMain["toolbox"]}>
					{/* displays current settings */}
					<SettingsPanel 
						numToFetch = {numToFetch} rank = {rank} popularity={popularity} histroMode={histroMode} filterOn = {filterOn} 
						fontSize={fontSize} charSpacing={charSpacing} 
						interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} >
					</SettingsPanel>

					{/* toggle the modes */}
					<ModeToggle histroMode={histroMode} setHistroMode={setHistroMode} 
								fontSize={fontSize} charSpacing={charSpacing} 
								interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} />

					{/* Filter buttons toolkit */}
					<div className = {stylesMain["filter-toolbox"]}>
						<FilterButtons working={true} id="numCards" setFilterVal={setNumToFetch} value="Number of Cards" 
										filterOn={filterOn} setFilterOn={setFilterOn} filterDisplay={false} 
										fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} />
						<FilterButtons working={true} id="taxonType" setFilterVal={setRank} value="Taxon Rank" 
										filterOn={filterOn} setFilterOn={setFilterOn} filterDisplay={false} 
										fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} />
						<FilterButtons working={true} id="popularity" setFilterVal={setPopularity} value="Popularity Sort" 
										filterOn={filterOn} setFilterOn={setFilterOn} filterDisplay={false} 
										fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} />
						
						<FontSizeSelector filterOn = {filterOn} setFilterOn={setFilterOn} value={fontSize} 
											fontSize={fontSize} setFontSize={setFontSize} 
											charSpacing={charSpacing} setCharSpacing = {setCharSpacing}
											interWordSpacing = {interWordSpacing} setInterWordSpacing = {setInterWordSpacing}
											lineSpacing = {lineSpacing} setLineSpacing = {setLineSpacing} />
					</div>
				</div>

				<Body className={stylesBody["container"]} numToFetch={numToFetch} rank = {rank} popularity = {popularity} histroMode={histroMode} 
						fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} />
			</div>

			<Footer />
		</Fragment>
	);
}
