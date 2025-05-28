"use client";

import React, { useRef } from "react";
import Link from "next/link";

import styles from "./Header.module.css";

export default function Header() {
  const mobileNavRef = useRef();
  const hamburgerRef = useRef();
  const backdropRef = useRef();

  let showNav = false;
  const toggleNav = () => {
    showNav = !showNav;

    mobileNavRef.current.className = `${styles["mobile-nav"]} ${showNav ? styles["open"] : ""}`;
    hamburgerRef.current.className = `${styles["hamburger"]} ${showNav ? styles["open"] : ""}`;
    backdropRef.current.className = `${styles["backdrop"]} ${showNav ? styles["open"] : ""}`;
  }

  return (
    <header className={styles["header"]}>
      <Link className={styles["header-title"]} href="/">DinoWiki.</Link>

      <button ref={hamburgerRef} onClick={toggleNav} className={styles["hamburger"]}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div ref={backdropRef} onClick={toggleNav} className={styles["backdrop"]}></div>
      <nav ref={mobileNavRef} className={styles["mobile-nav"]}>
        <Link onClick={toggleNav} href="/search">Search</Link>
        <Link onClick={toggleNav} href="/map">Maps</Link>
        <Link onClick={toggleNav} href="/timeline">Timeline</Link>
        <Link onClick={toggleNav} href="/tree">Phylogenetic Tree</Link>
      </nav>

      <nav className={styles["desktop-nav"]}>
        <Link href="/search">Search</Link>
        <Link href="/map">Maps</Link>
        <Link href="/timeline">Timeline</Link>
        <Link href="/tree">Phylogenetic Tree</Link>
      </nav>
    </header>
  );
}