
'use client';
import 'react';
import { useState } from "react";
import { useSearchParams } from 'next/navigation'
import SearchList from "@/components/Search/SearchList"
import "@/components/Search/Featured"
import styles from '@/components/Search/SearchPage.module.css'
import Link from 'next/link'
import Footer from '@/components/UI/Footer';
import Featured from '@/components/Search/Featured';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleInfo,faArrowUp, faArrowDown} from "@fortawesome/free-solid-svg-icons";

export const SIZE_LINE_DIVIDER = 10;
export const DEFAULT_FONT_SIZE = 1.2;
export const DEFAULT_CHAR_SPACE_SIZE = 0.05;
export const DEFAULT_INTER_WORD_SPACE_SIZE = 0.175;
export const DEFAULT_LINE_SPACE_SIZE = 1.5;


// Code from Group 22
export const fontStyles = (fontSize:number, charSpacing:number, interWordSpacing:number, lineSpacing:number) => {

    return {
		fontSize: `${fontSize}em`,
        letterSpacing: `${charSpacing}em`,
		wordSpacing: `${interWordSpacing}em`,
		lineHeight: `${lineSpacing}em`
    };
};


function SearchPage() {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE); 
	const [charSpaceSize,  setCharSpaceSize] = useState(DEFAULT_CHAR_SPACE_SIZE); 
	const [interWordSpaceSize,setInterWordSpaceSize] = useState(DEFAULT_INTER_WORD_SPACE_SIZE); 
	const [lineSpaceSize, setLineSpaceSize] = useState(DEFAULT_LINE_SPACE_SIZE); 

  // take an input parameter into account if one exists
  const router = useSearchParams();
  const input = router.get('input');

  // setting up icons
  const info = <FontAwesomeIcon icon={faCircleInfo}style={{fontSize: '1.3rem', color: 'var(--brand-900)'}} />
  const arrowUp = <FontAwesomeIcon icon={faArrowUp}style={{fontSize: '1.3rem', color: 'var(--brand-100)'}} />
  const arrowDown = <FontAwesomeIcon icon={faArrowDown}style={{fontSize: '1.3rem', color: 'var(--brand-100)'}} />

  //setting the input of text for entity page
  const [searchInput, setInput] = useState(input);
  const [placehold, setPlaceHolder] = useState("Search here...")

  //setting the input of text for image gallery, with default fossil if nothing searched
  const [imageInput, setImageInput] = useState(input);
  const [openedDocumentation, documentationOpen] = useState(false);

  //setting the constant that defines whether the results are shown
  const [listHidden, setListHidden] = useState(true);

  //function for adding text into variables
  const typeText = (entry:React.ChangeEvent<HTMLInputElement> ) => {
    entry.preventDefault();
    setInput(entry.target.value);
    setImageInput(entry.target.value);
    listHidden ? setListHidden(false) : setListHidden(true);
  };

  return (
    <div>
        <div style={fontStyles(fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize)}>
      {/* The documentation for advanced searching */}
      <button className={styles.documentationOpenButton} onClick={()=>{documentationOpen(true)}}>Advanced Search Tips {arrowDown}</button>
      {openedDocumentation &&(
          <div className={styles.documentationBox}>
               <button className={styles.documentationCloseButton} onClick={()=>{documentationOpen(false)}}>{arrowUp}</button>
          {/* Text for documentation */}
          <h3 id="advanced-search">Advanced Search</h3>
          <p><strong>Searching Content</strong></p>
          <p>By default, search both names and article content, prioritising names
          matches over content matches. However, article content and name can be
          searched over individually:</p>
          <ul>
          <li><p><em>Search by name only:</em></p>
          <p><code>name:(t rex)</code></p></li>
          <li><p><em>Search article content only:</em></p>
          <p><code>content:(lives in water)</code></p></li>
          <li><p><em>Search descriptions:</em></p>
          <p><code>description:(coral)</code></p></li>
          <li><p><em>Search descriptions and name:</em></p>
          <p><code>description:(beetle) t rex</code></p></li>
          </ul>
          <p><strong>Advanced Syntax</strong></p>
          <ul>
          <li><p>Each word in the search is treated as an individual search term.
          Use quotation marks to denote a <strong>phrase</strong>:</p>
          <pre><code>&quot;genus of molluscs&quot;</code></pre>
          <p>searches for the phrase “genus of molluscs”.</p>
          <pre><code>genus of molluscs</code></pre>
          <p>searches for the words genus, of, and molluscs individually.</p>
          <p>The latter does not guarantee that the words occur next to eachother,
          or at all. For example, it may return mammal genera, ignoring the
          molluscs part of the query entirely.</p></li>
          <li><p>Certain words in a search query can be <strong>boosted</strong> to make them more important:</p>
          <pre><code>shark^5 fish</code></pre>
          <p>will search for sharks or fishes always listing sharks
          first.</p></li>
          </ul>
          </div>)}

      <main className={styles.main}>
        <div className={styles.wrapper}>
        <div className={styles.searching}>
          <h1 className={styles.h1}>Paleontology Search</h1>
          <form className={`${styles.search} ${styles.container}`} id="form">
            {/* Search features */}
            <input type="text" id="searchQuery" placeholder={placehold} name="search" onChange={typeText} value={searchInput ?? ""}/>
            <button type="submit" id="button" >{listHidden ? "Enter" : "Clear"}</button> 

            {/* Image Gallery button with its information icon */}
            <div className={styles.infoContainer}>
              <Link href={{pathname: '/gallery', query: {input:imageInput},}}><button>Image Gallery</button></Link>
              <div className={styles.tooltip}>{info}
                    <span className={styles.tooltiptext}>Search the picture gallery, instead of article pages</span>
              </div>

          </div>
            
          </form>
          
          {/* The Search Results */}
          <div id="clickedElement" className={styles.container}> <SearchList searchInput={searchInput ?? ""} /> </div>
        </div>

        {/* Reccomendations Container */}
        <div id="recommendations">
          <div className={styles.infoContainer}>
            <h2 className={styles.h2}>Recommendations</h2>

            <div className={styles.tooltip}>{info}
                <span className={styles.tooltiptext}>Try out these interesting recommended article pages</span>
            </div>
          </div>
          <div className={`${styles.recommendationsContainer} ${styles.title} ${styles.container}`} >
            <Featured n={3} />
          </div>
        </div>
      </div>
    </main>
      <Footer/>
      </div>
    </div>
  );
}
export default SearchPage
