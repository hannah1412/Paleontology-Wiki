import { React } from "react";
import Link from "next/link";
import styles from "./CSS/InformationPanelWidget.module.css";

// Function component for the card of widget
const InformationPanelWidget = ({ hasMarker, fossilParams }) => {

    if (!hasMarker)
        return <div className={styles["empty_card"]}>
        <div className={styles["placeHolderText"]}>
        <p><b>No plots found for this entry in Wikidata...to find more maps click  <Link href="/map">here</Link> </b></p>
        </div>
    </div>;

    else {
        if (fossilParams == null)
        return <div className={styles["card"]}>
            <div className={styles["placeHolderText"]}>
            <p><b>Hover over an icon for discovery location information.</b></p>
            </div>
        </div>;

    const discoveryLocation = fossilParams[0]
    const country = fossilParams[1]
    const continent = fossilParams[2]

    return <div className={styles["card"]}>
        <div className={styles["cardText"]}>
            <p><b>Discovery Location:</b> {discoveryLocation}</p>
            <p><b>Country:</b> {country}</p>
            <p><b>Continent: </b>{continent}</p>
        </div>
    </div>;
    }
};
export default InformationPanelWidget;