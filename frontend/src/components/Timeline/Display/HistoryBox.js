'use client';

import React,  {useState, useEffect,useRef} from "react";
import stylesHistoryBox from '../Styles/HistoryBox.module.css';
import HistroTimeline from "./HistroTimeline"
import {formatItemInfo} from "./HistroFunctions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownLeftAndUpRightToCenter} from "@fortawesome/free-solid-svg-icons";

const CLOSE = <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} style={{fontSize: '1.5rem'}} />

/**
 * Displays Histropedia timeline information for individual entries, appears
 * upon clicking the entry's card.
 * @param {*} item contains the entry's information
 * @param {*} onClose the function to execute when the component is closed
 * @returns a pop up box with the Histropedia timeline
 */
export default function HistoryBox({ item, onClose }) {
    const [itemInfo, setItemInfo] = useState(null)
    const buttonRef = useRef();

    // to close pop up when using keyboard navigation
    function handleKeyDownClose(event) {
        if (event.key === 'Enter') {
            onClose()
        }
    }

    // re-loads component when item value changes 
    useEffect(() => {
        if (item && item.length >= 3) {
            setItemInfo(formatItemInfo(item, 1))
        }
        if (itemInfo) {
            buttonRef.current.focus();
        }
    }, [item]);
    
    return (
        <div className={stylesHistoryBox["overlay"]}>
            <button id="history_box" tabIndex={0} onKeyDown={handleKeyDownClose} className={stylesHistoryBox["close"]} onClick={onClose} ref={buttonRef}>{CLOSE}</button>
            <div className={stylesHistoryBox["container"]}>
                {itemInfo && (
                    <HistroTimeline itemsInfo={[itemInfo]} timelineID={"card"}/>
                )}
            </div>
        </div>
    );
}
