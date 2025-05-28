import React, {Fragment, useState} from "react";

import styles from "./ToggleSwitch.module.css";

export default function ToggleSwitch(props) {
    const [checked, setChecked] = useState (true);
    const toggleButton = () => {
        setChecked((prevValue) => !prevValue);
        props.toggle((prevValue) => prevValue === "off" ? "on" : "off");
    }
    return (
        <Fragment>
            <label className={styles.switch}>
                <input type="checkbox" checked = {checked} onChange={toggleButton} className={styles.input}/>
                <span className={styles.slider}/>
            </label>
        </Fragment>
    );
}
