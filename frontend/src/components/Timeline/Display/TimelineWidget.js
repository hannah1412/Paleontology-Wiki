'use client';

import React, { useEffect, useState } from 'react';
import stylesHistroSpace from '../Styles/HistroSpace.module.css';
import {formatItemInfo, deformatString} from "./HistroFunctions"
import HistroTimeline from './HistroTimeline';
import Link from 'next/link';

/**
 * Timeline widget visualizing the lifespan of a given taxon across time periods
 * @param {*} identifier the Wikidata identifier for the taxon
 * @returns the widget
 */
export default function TimelineWidget({identifier, timelineID}) { 
    // States to use for fetching data
    const [itemInfo, setItemInfo] = useState(null)

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_ADDR + '/timeline/req/id?';
    const requestParams = new URLSearchParams({'identifier': identifier})

    // Fetch data on the taxon's lifespan
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(BACKEND_URL + requestParams)
                const data = await res.json()

                // Extract the data and set the itemInfo value
                const dataArray = Object.values(data);
                let item = dataArray[0];
                const startTime = deformatString(item.startTime)
                const endTime = deformatString(item.endTime)
                setItemInfo(formatItemInfo([item, startTime, endTime], 1))
            } catch (err) {
                console.log("Could not fetch data.");
            }
        }
        fetchData()
    }, []) 

    return (
        <div className = {stylesHistroSpace.container}>
            {itemInfo ? (<HistroTimeline itemsInfo={[itemInfo]} timelineID={timelineID}/>) 
                      : (<h4>No timeline data found for this entry in Wikidata...to find more timelines click  <Link href="/timeline">here</Link></h4>)
                }
        </div>
    );
}
