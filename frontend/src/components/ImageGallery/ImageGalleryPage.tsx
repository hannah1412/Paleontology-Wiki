'use client';

import 'react';
import {useEffect, useState }from 'react';
import styles from './ImageGalleryPage.module.css';
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/UI/Footer';
import { SearchResponse, Image, SingleSearchResponse } from '@/search/types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleInfo, faDownLeftAndUpRightToCenter} from "@fortawesome/free-solid-svg-icons";
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


export default function ImageGallery() {
    // getting the parameter of search input

    const router = useSearchParams();

    // defining all the icons being used
    const info = <FontAwesomeIcon icon={faCircleInfo}style={{fontSize: '1.3rem', color: 'var(--brand-900)'}} />
    const minimise = <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter}style={{fontSize: '1.3rem'}} />

    // declaring the initial input variable
    const initialInput = router.get('input');

    const [searchInput, setInput] = useState(initialInput);
    const alphabetList = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    const MAX_SEARCH_RESULTS = 500;
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_ADDR;
    const [currentItem, setItem] = useState<SingleSearchResponse | undefined>();
    const [images, setImages] = useState<SearchResponse>([]);
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE); 
    const [charSpaceSize,  setCharSpaceSize] = useState(DEFAULT_CHAR_SPACE_SIZE); 
    const [interWordSpaceSize,setInterWordSpaceSize] = useState(DEFAULT_INTER_WORD_SPACE_SIZE); 
    const [lineSpaceSize, setLineSpaceSize] = useState(DEFAULT_LINE_SPACE_SIZE); 
    const [filterOn, setFilterOn] = useState(true)




    // Call search API to get images from backend
      const callSearchAPI = (term: string | null) => {
        setInput(term);
        const url = API_URL + "/search?q=" + term + "&total=" + MAX_SEARCH_RESULTS;
        fetch(url)
        .then((res) => res.json())
        .then((d) => setImages(d));
      };
      useEffect(() =>{
        callSearchAPI(searchInput);
       
      }, [searchInput])


      //declaring constant for opening or closing image
      const [openedImage, imageOpen] = useState(false);
      
      // function to change the input when typing into the search bar
      const typeText = (entry:React.ChangeEvent<HTMLInputElement>) => {
        
        entry.preventDefault();
        setInput(entry.target.value);

      }; 

  return (
    <div>
          <div style={fontStyles(fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize)}>
      <main className={styles.main}>
 
         {/* Defining the title */}
        <div className = "head" >       
            <div className={styles.infoContainer}>
              <h1 className={styles.h1}>Image Gallery</h1>
              <div className={styles.tooltip}>{info}
                  <span className={styles.tooltiptext}>Search up pictures! Click on the images to expand, and click on that expanded image to learn more...</span>
              </div>
            </div>
        </div>
         {/* The Search Bar */}
          <div className={styles.search}  id="form">
              <input type="text" id="searchQuery" placeholder="Search Image..." name="search" onChange={typeText} value={searchInput ?? ""}/>
          </div> 
        {/* The Alphabet List for a...z */}
        <ul className={styles.alphabet} style={{listStyleType: "none", display:"flex", flexDirection:"row"}}>
            {alphabetList.map((item) => (
                <li key={item} > 
                    <button key={item} onClick={() => {callSearchAPI(item+"*")}}>{item}</button>
                </li>
            ))}
        </ul>
      
        <div className={styles.tooltip}>{info}
              <span className={styles.tooltiptext}>Click on a letter to explore the paleontology images that start with it</span>
        </div>


        {/* The gallery of all images returned from API */}
        <div className={styles.gallery}style={{listStyleType: "none"}} >
          {images.map((item,idx) => (
          <a key={idx}>
            <li style={{flex:7}}>
                <img 
                    className={styles.galleryImage} 
                    src={item.image?.url ?? ""}
                    onClick={() => {imageOpen(true);setItem(item)}} 
                /> 
            </li>

            {/* The expanded image with its description, allowing redirection to its article page */}
              {openedImage && (
                  <div>
                    <div className={styles.container}>          
                      
                      <Link href={{
                          pathname: '/result' , query: {
                          id: currentItem?.id,
                          label: currentItem?.label,
                          description: currentItem?.shortDescription}, 
                        }}>

                        <img className={styles.expandedImage} src={currentItem?.image?.url ?? ""}></img>
                        <p className={styles.expandedImageText}>{currentItem?.label + ": " + currentItem?.shortDescription}</p>

                        
                      
                      </Link>
                      <button className={styles.closeButton} onClick={() => imageOpen(false)}>{minimise}</button>
                    </div>   
                  </div>    
              )}  
            </a>
          ))}
          </div>
          
      </main>
    <Footer/>
    </div>
  </div>
  )
}
