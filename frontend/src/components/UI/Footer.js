import React from "react";
import styles from "./Footer.module.css";
import Link from "next/link";
import {useSelector} from "react-redux";


const Footer = () => {
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
  return (
    <footer className={`${styles["footer"]}`}>
      <p className={styles["text"]}>This website makes use of information provided by Wikidata! If you would like to learn more or contribute to the project, click here: 
      <Link href="https://www.wikidata.org/wiki/Wikidata:Main_Page" target="_blank" className={reduceMotion === false ? styles["button"] : styles["button-reduce-motion"]}>Wikidata</Link>
      </p>
    </footer>
  );
};
export default Footer;
