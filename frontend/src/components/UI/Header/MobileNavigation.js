import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faUniversalAccess, faVolumeHigh, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import AccessilityMenu from "./AccessibilityMenu";
import { ThemeContext } from "@/store/ThemeContextProvider";

import styles from "./MobileNavigation.module.css";
import {useSelector} from "react-redux";

const MobileNavigation = ({ closeNav }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);

  const handleAccessibilityMenu = () => {
    setShowAccessibilityMenu(!showAccessibilityMenu);
  };

  const handleAccessibilityMenuClose = (e) => {
    if (!e.target || typeof e.target.className !== 'string') return;
    if (e.target.className.split(" ").includes("accessibility")) return;
    setShowAccessibilityMenu(false);
  };

  const handleSwitchTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (showAccessibilityMenu) document.addEventListener("click", handleAccessibilityMenuClose);

    return () => {
      document.removeEventListener("click", handleAccessibilityMenuClose);
    };
  }, [showAccessibilityMenu]);

  return (
    <div className={styles.panel}>
      <nav className={reduceMotion === false ? styles["navigation"] : styles["navigation-reduce-motion"]}>
        <Link onClick={closeNav} href="/search">Search</Link>
        <Link onClick={closeNav} href={{pathname: '/gallery', query: {input:""},}}>Gallery</Link>
        <Link onClick={closeNav} href="/map">Maps</Link>
        <Link onClick={closeNav} href="/timeline">Timeline</Link>
        <Link onClick={closeNav} href="/cladogram">Cladogram</Link>
      </nav>

      <div className={styles.actions}>
        <label className={styles.theme_switch_container}>
          <input onChange={handleSwitchTheme} className={reduceMotion === false ? styles["theme_checkbox"] : styles["theme_checkbox_reduce_motion"]} type="checkbox" defaultChecked={theme !== "light"}/>
          <div className={reduceMotion === false ? styles["theme_switch"] : styles["theme_switch_reduce_motion"]}>
            <FontAwesomeIcon icon={faMoon} className={styles.moon_icon}/>
            <div className={reduceMotion === false ? styles["theme_slider"] : styles["theme_slider_reduce_motion"]}/>
            {/* Sun Icon */}
            <svg className={styles.sun_icon} xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 256">
              <path fill="currentColor" d="M116 32V16a12 12 0 0 1 24 0v16a12 12 0 0 1-24 0m80 96a68 68 0 1 1-68-68a68.07 68.07 0 0 1 68 68m-24 0a44 44 0 1 0-44 44a44.05 44.05 0 0 0 44-44M51.51 68.49a12 12 0 1 0 17-17l-12-12a12 12 0 0 0-17 17Zm0 119l-12 12a12 12 0 0 0 17 17l12-12a12 12 0 1 0-17-17M196 72a12 12 0 0 0 8.49-3.51l12-12a12 12 0 0 0-17-17l-12 12A12 12 0 0 0 196 72m8.49 115.51a12 12 0 0 0-17 17l12 12a12 12 0 0 0 17-17ZM44 128a12 12 0 0 0-12-12H16a12 12 0 0 0 0 24h16a12 12 0 0 0 12-12m84 84a12 12 0 0 0-12 12v16a12 12 0 0 0 24 0v-16a12 12 0 0 0-12-12m112-96h-16a12 12 0 0 0 0 24h16a12 12 0 0 0 0-24"/>
            </svg>
          </div>
        </label>

        <button onClick={handleAccessibilityMenu} className={reduceMotion === false ? styles["accessibility_button"] : styles["accessibility_button_reduce_motion"]}>
          <FontAwesomeIcon icon={faUniversalAccess} className={styles.accessibility_icon}/>
        </button>
        {showAccessibilityMenu && <AccessilityMenu className={styles.menu}/>}
      </div>
    </div>
  );
};
export default MobileNavigation;
