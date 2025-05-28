"use client";

import React,  {useState, useEffect} from "react";
import stylesBody from "./Styles/Body.module.css";

import BodyPeriodHeader from "./HeaderTabs/BodyPeriodHeader"
import TimelineInterval from "./HeaderTabs/TimelineInterval";
import CardSpace from "./Display/CardSpace"
import HistroSpace from "./Display/HistroSpace"
import {fontStyles} from './TimelinePage.js';

export default function Body(props) {
	// states to use for fetching data
	const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_ADDR + '/timeline/req/date?';
	const [period, setPeriod] = useState("Cambrian");
	const [data, setData] = useState("");
	const [searchDisplayData, setSearchDisplayData] = useState("");
	const [isSearchData, setIsSearchData] = useState(false);
	const [err, setErr] = useState();

	// states for handling dates
	const [startTime, setStartTime] = useState("-540000000-01-01T00:00:00Z");
	const [endTime, setEndTime] = useState("-488000000-01-01T00:00:00Z");
	const [startYear, setStartYear] = useState(-540);
	const [endYear, setEndYear] = useState(-488);
	const [timeRange, setTimeRange] = useState(0);

	const [displayStartCount, setDisplayStartCount] = useState(0);
	const {numToFetch, rank, popularity, histroMode, fontSize, charSpacing, lineSpacing, interWordSpacing} = props
	const buttonStyles = fontStyles(fontSize, charSpacing, interWordSpacing, lineSpacing);

	// function runs whenever period, or num entries to fetch changes
	useEffect(() => {
		async function fetchData() {
			try {
				const popularity_boolean = popularity == 'lowest' ? true : false
				const requestParams = new URLSearchParams({'startTime': startTime, 'endTime': endTime, 'n': numToFetch,
					'rank': rank, 'reversePopularity': popularity_boolean})
		
				// Fetch data from local API
				const res = await fetch(BACKEND_URL + requestParams)
				const data = await res.json()
				setData(data);
				setSearchDisplayData(data);
			} catch (err) {
				setErr({message: err.message || "Could not fetch data."});
			}
		}
		fetchData();

		if (err) {
			console.log(err.message);
		}
	}, [numToFetch, startTime, endTime, rank, popularity]); 

	useEffect(() => {
    }, [isSearchData]);


	// return body component
	return (
		<div className = {stylesBody.body} style={buttonStyles} > 
			<div className={stylesBody["btn-container"]}></div>
			<div className={stylesBody["timescale"]}>
				<BodyPeriodHeader
					setPeriod={setPeriod} period={period} 
					setStartTime={setStartTime} setEndTime ={setEndTime}
					setStartYear={setStartYear} setEndYear={setEndYear} 
					startYear={startYear} endYear={endYear}
					setTimeRange={setTimeRange}
					setDisplayStartCount = {setDisplayStartCount} 
					fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} 
				/>
				
				<TimelineInterval 
					period={period} setPeriod = {setPeriod}
					startYear={startYear} endYear={endYear} 
					setStartYear={setStartYear} setEndYear={setEndYear} 
					timeRange={timeRange} setTimeRange={setTimeRange}
					startTime = {startTime} endTime = {endTime}
					setStartTime = {setStartTime} setEndTime = {setEndTime} 
					displayStartCount = {displayStartCount} setDisplayStartCount={setDisplayStartCount}
					data={data} setSearchDisplayData={setSearchDisplayData} setIsSearchData={setIsSearchData}
					fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} 
				/>
        	</div>

			{histroMode && isSearchData && (<HistroSpace data={searchDisplayData}/>)}
			{histroMode && !isSearchData && (<HistroSpace data={data}/>)}

			{!histroMode && isSearchData && (<CardSpace data={searchDisplayData} fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} />)}
			{!histroMode && !isSearchData && (<CardSpace data={data} fontSize={fontSize} charSpacing={charSpacing} interWordSpacing = {interWordSpacing} lineSpacing = {lineSpacing} />)}
		</div>
	);
};
	
    
