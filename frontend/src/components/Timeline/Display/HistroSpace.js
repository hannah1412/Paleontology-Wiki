"use client";

import React,  {useState, useEffect} from "react";
import stylesHistroSpace from '../Styles/HistroSpace.module.css';
import HistroTimeline from "./HistroTimeline"
import {formatItemInfo, deformatString} from "./HistroFunctions"


/**
 * Contains Histropedia timeline showing the same entries currently displayed in the
 * card space.
 * @param {*} data contains the data of all entries currently displayed
 * @returns component containing the timeline
 */
export default function HistroSpace({data}) {
    const dataArray = Object.values(data);
    // item has structure [itemData, start, end]
    const [itemsInfo, setItemsInfo] = useState(null)
    
    useEffect(() => {
        let itemsInfoTemp = [];

        for (let index = 0; index < dataArray.length; index++) {
            let item = dataArray[index];
            const startTime = deformatString(item.startTime)
            const endTime = deformatString(item.endTime)
            
            let itemData = [item, startTime, endTime]

            if (itemData && itemData.length >= 3) {
                itemsInfoTemp.push(formatItemInfo([item, startTime, endTime]));
            }
        }

        setItemsInfo(itemsInfoTemp)
    }, [data]);
    return (
        <div className = {stylesHistroSpace.container}>
            {itemsInfo && (
                <HistroTimeline itemsInfo={itemsInfo} timelineID={"main"}/>
            )}
        </div>
    );
}
