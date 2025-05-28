'use client';

import React, { useEffect, useState, useContext} from 'react';
import HistroOptions from './HistroOptions.js';
import PeriodArticles from './PeriodArticles.js';
import zoomVals from './ZoomOptions.json'
import { ThemeContext } from "@/store/ThemeContextProvider";
import {useSelector } from 'react-redux';

const DEFAULT_START_YEAR = -540000000
const DEFAULT_END_YEAR = -514000000

/**
 * The Histropedia Timeline
 * @param {itemsInfo, timelineID} params the parameters of the timeline, including
 *  information on the items to show on the timeline and the timeline's ID
 * @returns React Component containing the timeline
 */
export default function HistroTimeline({itemsInfo, timelineID}) {
    const [Histropedia, setHistropedia] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [browserZoomLevel, setBrowserZoomLevel] = useState(window.devicePixelRatio)
    const theme = useContext(ThemeContext).theme;
    const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
    // Dynamically import Histropedia (Since jquery uses document and window which are not defined in next js when it starts up the page)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('../HistropediaAPI/histropedia-1.2.0')
                .then((myModule) => {
                    setHistropedia(myModule.Histropedia);
                    setIsLoaded(true)
            }).catch(error => {
                console.error("Failed to load Histropedia Timeline: ", error);
            });
        }
    }, []);

        /**
     * Calculate the zoom level of the timeline
     * @param {*} duration the duration of the first entry's lifespan
     * @param {*} sYear the start year of the first entry in the timeline
     * @returns the zoom level 
     */
        const calcZoom = ((duration, sYear) => {
            let timeDays = duration * 365
            let lower = [0,0]
            let upper = [0,0]
            let flag = true
            for (let key in zoomVals[0]) {
                let val = zoomVals[0][key]
                if (timeDays > val) {   // get lower bound
                    lower = [parseInt(key), val]
                }else {
                    if (flag) {     // get upper bound
                        upper = [parseInt(key), val]
                        flag = false
                    }
                }
            }
            // Calculate the log ratio of period duration and zoom time scale duration to center timeline
            let zoom = lower[0] + Math.floor(Math.log(timeDays-lower[1])/(Math.log(upper[1]-lower[1])) * (upper[0]-lower[0])) 
            return zoom
        })
    
        /**
         * Gets the zoom level of the timeline and the adjusted start year as a result
         * @param {*} itemsInfo contains information on the items to be shown on the timeline
         * @returns the adjusted start year of the timeline and the zoom level
         */
        const getDateZoom = ((itemsInfo) => {
            let yFrom = itemsInfo[0].from.year
            let p = PeriodArticles()
            let sYear = DEFAULT_START_YEAR
            let eYear = DEFAULT_END_YEAR
            let zoomScale = calcZoom(eYear-sYear) // Default zoom scale
            for (let i=0; i<p.length; i++) {
                let s = p[i].from.year
                let e = p[i].to.year
                if (s <= yFrom && yFrom <= e) {
                    sYear = s
                    eYear = e
                    zoomScale = calcZoom(e-s)
                }
            }
    
            let periodLength = eYear - sYear;
            let offset = -0.5;
            let adjustedSYear = sYear - Math.floor(periodLength * offset);
            let liveAfterMidOfPeriod = periodLength*0.5 - (yFrom-eYear)
            if (liveAfterMidOfPeriod > 0) {     // If item starts after the 60% of the period
                zoomScale = zoomScale + 1       // Increase zoom value so that it shows on timeline
            }
    
            return [adjustedSYear, zoomScale]
        })

    // Initialize Histropedia Timeline 
    useEffect(() => {
        if (isLoaded && document.getElementById(timelineID)) {
            const container1 = document.getElementById(timelineID);

            // Define width of timeline relative to window size (for timelines within cards, they must be smaller)
            let widthRatio;
            switch (timelineID) {
                case "main":
                    widthRatio = 0.97;
                    break;
                case "card":
                    widthRatio = 0.67;
                    break;
                case "widget":
                    widthRatio = 0.95;
                    break;
                case "expandedWidget":
                    widthRatio = 0.67;
                    break; 
                default:
                    widthRatio = 0.96;
                    break;
            }

            const options = HistroOptions(window.innerWidth, widthRatio, browserZoomLevel)

            let articles = PeriodArticles().concat(itemsInfo)

            // Clear previous timeline if it existed
            container1.replaceChildren()

            // Initialise styles and zoom values
            const histroTimeline = new Histropedia.Timeline(container1, options);
            histroTimeline.setOption("article.defaultActiveStyle", {color: '#062261'})
            histroTimeline.setOption("article.defaultStyle", {color: "#FBB7B5"})
            histroTimeline.setOption("article.density", Histropedia.DENSITY_LOW)
            histroTimeline.load(articles);
            let zoomVal = getDateZoom(itemsInfo)
            const startDate = new Histropedia.Dmy(zoomVal[0],1,1)
            histroTimeline.setStartDate(startDate)
            histroTimeline.setZoom(zoomVal[1])
            
            /* For "card" and "widget" mode timelines which feature only 1 taxon, centre the timeline on
            that taxon */
            if (timelineID == "card" || timelineID == "widget" || timelineID == "expandedWidget") {
                let taxonArticleID = itemsInfo[0].id
                let taxonArticle = histroTimeline.getArticleById(taxonArticleID)
                let taxonArticleDate = new Histropedia.Dmy(taxonArticle.data.from.year, 1, 1)
                histroTimeline.setStartDate(taxonArticleDate, histroTimeline.width/2)
            }

            // Change marker colors to white for dark theme
            if (theme == "dark") {
                histroTimeline.setOption("style.marker.minor", {color: "#fff"})
                histroTimeline.setOption("style.marker.major", {color: "#fff"})
                histroTimeline.setOption("style.dateLabel.minor", {color: "#fff"})
                histroTimeline.setOption("style.dateLabel.major", {color: "#fff"})
            }

            if (reduceMotion) {
                histroTimeline.setOption("article.animation.move", {active: false})
                histroTimeline.setOption("article.animation.fade", {active: false})
            }

            // Handler function for dynamic resizing
            let currWidth = window.innerWidth

            /**
             * Handles resizing of the window wherein the timeline is displayed
             */
            function resizeHandler() {
                setBrowserZoomLevel(window.devicePixelRatio)
                if (window.innerWidth != currWidth) {
                    if (timelineID == "card" || timelineID == "expandedWidget") {
                        histroTimeline.setOption("width", window.innerWidth * widthRatio)
                    } else {
                        histroTimeline.setOption("width", histroTimeline.options.width + (window.innerWidth - currWidth))
                    }

                    // Keep active article at centre of timeline upon resizing window's width
                    let activeArticle = histroTimeline.getActiveArticle()
                    let activeArticleDate = new Histropedia.Dmy(activeArticle.data.from.year, 1, 1)
                    histroTimeline.setStartDate(activeArticleDate, histroTimeline.width/2)
                }
               
                currWidth = window.innerWidth
            }
            window.onresize = resizeHandler
        }
        
    }, [isLoaded, itemsInfo, theme, reduceMotion]);

    
    return (
        <div className={"timeline"} id={timelineID}/>
    );
};