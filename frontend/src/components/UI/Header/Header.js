"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faUniversalAccess, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "@/store/ThemeContextProvider";
import AccessilityMenu from "./AccessibilityMenu";
import MobileNavigation from "./MobileNavigation";
import styles from "./Header.module.css";
import SearchList from "@/components/Search/SearchList";
import HidableCard from "@/components/UI/HidableCard"
import { Container } from "postcss";
import {useSelector} from "react-redux";

const Header = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [searchInput, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);

  const handleAccessibilityMenu = () => {
    setShowAccessibilityMenu(!showAccessibilityMenu);
  };

  const handleAccessibilityMenuClose = (e) => {
    if (!e.target || typeof e.target.className !== 'string') return;
    if (e.target.className.split(" ").includes("accessibility")) return;
    setShowAccessibilityMenu(false);
  };

  const handleNavigation = () => {
    setShowMobileNav(!showMobileNav);
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

  const clickEnter = (entry) => {
    entry.preventDefault();
  };

  const typeText = (entry) => {
    entry.preventDefault();
    setShowDropdown(true)
    setInput(entry.target.value);
  };

  return (
    <header className={styles.header}>
      <Link className={styles.title} href="/">DinoWiki.</Link>

      {/* Desktop Navigation */}
      <div className={styles.actions}>
        <div className={styles.search}>
          <input type="text" id="searchQuery" placeholder="Search Item..." name="search" onChange={typeText} value={searchInput}/>
          <Link href={`/search?input=${searchInput}`} className={reduceMotion === false ? styles["button"] : styles["button-reduce-motion"]}><FontAwesomeIcon icon={faMagnifyingGlass} className={styles.icon} /></Link>
          { searchInput && showDropdown ?
            <HidableCard show={showDropdown} onClickOutside={() => {setShowDropdown(false); setInput("");}} style={{position: "absolute", top: 4.5 + "rem", width: 30 + "rem", textAlign: "left", zIndex: 5000}}>
              <SearchList searchInput={searchInput}/>
            </HidableCard>
            : null
          }
        </div>


        <nav className={reduceMotion === false ? styles["navigation"] : styles["navigation-reduce-motion"]}>
          <Link href={{pathname: '/gallery', query: {input:""},}}>Gallery</Link>
          <Link href="/map">Maps</Link>
          <Link href="/timeline">Timeline</Link>
          <Link href="/cladogram">Cladogram</Link>
        </nav>

        <label className={styles["theme_switch_container"]}>
          <input onChange={handleSwitchTheme} className={reduceMotion === false ? styles["theme_checkbox"] : styles["theme_checkbox_reduce_motion"]} type="checkbox" checked={theme === "light"}/>
          <div className={reduceMotion === false ? styles["theme_switch"] : styles["theme_switch_reduce_motion"]}>
            <FontAwesomeIcon icon={faMoon} className={styles["moon_icon"]}/>
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
        {showAccessibilityMenu && <AccessilityMenu className={styles.accessibility_menu_position}/>}
      </div>

      {/* Mobile Navigation */}
      <button onClick={handleNavigation} className={`${showMobileNav ? styles.open : ""} ${styles.hamburger}`}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </button>
      {showMobileNav &&
      <MobileNavigation closeNav={handleNavigation} />}
    </header>
  );
};
export default Header;
