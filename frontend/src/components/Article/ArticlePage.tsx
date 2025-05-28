// @ts-nocheck
'use client';

import '@/global.css';
import React, { useEffect } from "react";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation'
import LinkBox from '@/components/Article/LinkBox'
import ArticleContent from '@/components/Article/ArticleContent'
import Gallery from '@/components/Article/Gallery'
import styles from './ArticlePage.module.css'
import Footer from '@/components/UI/Footer';
import Widget from "@/components/Tree/Widget/Widget";
import TimelineWidget from '../Timeline/Display/TimelineWidget';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownLeftAndUpRightToCenter, faUpRightAndDownLeftFromCenter,faCircleInfo, faVolumeHigh,faUniversalAccess} from "@fortawesome/free-solid-svg-icons";

import {ArticleContentResponse,ArticleImagesResponse} from '@/search/types'
import FontSizeSelector from './SizeSelector.js'

//Added by group 21
import dynamic from 'next/dynamic';
const MapWidget =  dynamic(() => import('../Map/MapWidget'),{
  ssr: false
})

const minimise = <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter}style={{fontSize: '1.3rem'}} />
const maximise = <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}style={{fontSize: '1.3rem'}} />
const info = <FontAwesomeIcon icon={faCircleInfo}style={{fontSize: '1.3rem', color: 'var(--brand-900)'}} />
const darker = <FontAwesomeIcon icon={faUniversalAccess}style={{fontSize: '3rem', cursor:'pointer'}} />
const lighter = <FontAwesomeIcon icon={faUniversalAccess}style={{fontSize: '3rem', color: 'var(--grey-300)', cursor:'pointer'}} />

export const SIZE_LINE_DIVIDER = 10;
export const DEFAULT_FONT_SIZE = 1.2;
export const DEFAULT_CHAR_SPACE_SIZE = 0.05;
export const DEFAULT_INTER_WORD_SPACE_SIZE = 0.175;
export const DEFAULT_LINE_SPACE_SIZE = 1.5;


// Code from Group 22
export const fontStyles = (fontSize, charSpacing, interWordSpacing, lineSpacing) => {

    return {
		fontSize: `${fontSize}em`,
        letterSpacing: `${charSpacing}em`,
		wordSpacing: `${interWordSpacing}em`,
		lineHeight: `${lineSpacing}em`
    };
};


export default function ArticlePage() {

  //getting parameters, to allow relevant data to be fetched
  const router = useSearchParams();

  const ID = router.get('id');
  const N_IMAGES = 5


 
  // shortDescription = shortDescription ? shortDescription.charAt(0).toUpperCase() + shortDescription.slice(1) + "." : ""; // capitalise the first letter of the description and add a full stop at the end

  //declaring and initialising the data
  const [data, setData] = useState<ArticleContentResponse>({
    label: "loading"
  });

  const [images, setImages] = useState<ArticleImagesResponse>(
    [{url:" ", altText:" "}]);

  //calling the API to get data
  const callArticleAPI = () => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_ADDR}/article/content?id=${ID}`;
    fetch(url)
      .then(response => response.json())
      .then(data => setData(data))
  };

  const callImagesAPI = () => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_ADDR}/article/images?id=${ID}&n=${N_IMAGES}`;
    fetch(url)
      .then(response => response.json())
      .then(images => setImages(images))
  }
  //getting ID from api
  useEffect(() => {
    callArticleAPI();
  }, [ID]);

  //getting images from api
  useEffect(() => {
    callImagesAPI();
  }, [ID,N_IMAGES]);

  function speak(word: string | undefined) {
    const speech = new SpeechSynthesisUtterance(word);
    const voices = speechSynthesis.getVoices();
    speech.voice = voices[0];
    speechSynthesis.speak(speech);
  }

  // Accessibility states
  const [accOn, setAccOn] = useState(false)

	const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE); 
	const [charSpaceSize,  setCharSpaceSize] = useState(DEFAULT_CHAR_SPACE_SIZE); 
	const [interWordSpaceSize,setInterWordSpaceSize] = useState(DEFAULT_INTER_WORD_SPACE_SIZE); 
	const [lineSpaceSize, setLineSpaceSize] = useState(DEFAULT_LINE_SPACE_SIZE); 
  const [filterOn, setFilterOn] = useState(true)

  const [expandedText, textExpand] = useState(false);
  const [expandedMap, mapExpand] = useState(false);
  const [expandedTree, treeExpand] = useState(false);
  const [expandedTimeline, timelineExpand] = useState(false);



  return (
    <div>
    <div style={accOn ? fontStyles(fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize) : null}>

       <h1 className={styles.mainTitle}>{data.label}</h1>
       <div style={{display: 'flex', justifyContent: 'center'}}>   
       <div onClick={() => setAccOn(prevAccOn => !prevAccOn)} >{accOn ? darker : lighter}</div>
    
       </div> 
       { accOn ? <FontSizeSelector filterOn = {filterOn} setFilterOn={setFilterOn} value={fontSize} 
											fontSize={fontSize} setFontSize={setFontSize} 
											charSpaceSize={charSpaceSize} setCharSpaceSize = {setCharSpaceSize}
											interWordSpaceSize = {interWordSpaceSize} setInterWordSpaceSize = {setInterWordSpaceSize}
                      lineSpaceSize = {lineSpaceSize} setLineSpaceSize = {setLineSpaceSize} />
                      : null}
      <main className={styles.wrapperRow}>
      <main className={styles.wrapperColumn}>

      <div className={styles.containerText}>
        <div className={styles.buttonContainer}>
       
                <div>
                <LinkBox links={[{name: 'Wikipedia',url: data.wikipediaLink},{name: 'Google', url: data.googleLink}].filter((l): l is {url: string, name:string}  => l.url != undefined)} />
                <div className={styles.tooltip}>{info}
                    <span className={styles.tooltiptext}>Go to wikipedia page of {data.label}</span>
                </div>
              </div>

              <button onClick={() => textExpand(true)}>{maximise}</button>
      </div>
      
      <div>
          <div className={styles.audioContainer}>
            <h1 className={styles.capitalise}> {data.shortDescription} </h1>
            <FontAwesomeIcon onClick={() => speak( data.shortDescription )} icon={faVolumeHigh} className={styles.audioIcon}/>
          </div>
          


          { data.description ?
          <ArticleContent>
            {data.description}
          </ArticleContent> : null}
        </div>
      </div>

      <div className={styles.containerMap}>
        <button onClick={() => mapExpand(true)}>{maximise}</button>
        <div className={styles.infoContainer}>
            <div className={styles.audioContainer}>
              <h1> Where can you find it? </h1>
              <FontAwesomeIcon onClick={() => speak( "Where can you find it?" )} icon={faVolumeHigh} className={styles.audioIcon}/>
            </div>
            <div className={styles.tooltip}>{info}
                <span className={styles.tooltiptext}>A map of where you can find {data.label} fossils around the world</span>
            </div>
        </div>
        {/* Added by group 21 */}
        <MapWidget fossilID = {ID}></MapWidget>
      </div>

    </main>

      <main className={styles.wrapperColumn}>
      <div className={styles.containerImages}>
        <Gallery images={images} />
      </div> 

      <div className={styles.containerTree}>
      <button onClick={() => treeExpand(true)}>{maximise}</button>
      <div className={styles.infoContainer}>
            <div className={styles.audioContainer}>
              <h1> How can it be classified? </h1>
              <FontAwesomeIcon onClick={() => speak( "How can it be classified?" )} icon={faVolumeHigh} className={styles.audioIcon}/>
            </div>
           
              <div className={styles.tooltip}>{info}
                  <span className={styles.tooltiptext}>A cladogram with phylogentic information of {data.label}</span>
              </div>
          </div>

          {/* start of what was added by group 23 */}
          <Widget qNumber={ID} larger={false} />
          {/* end of what was added by group 23 */}

      </div>
      </main>
      </main>

      <main className={styles.wrapperRow}>
      <div className={styles.containerTimeline}>
      <button onClick={() => timelineExpand(true)}>{maximise}</button>
      <div className={styles.infoContainer}>
            <div className={styles.audioContainer}>
              <h1> When did it live? </h1>
              <FontAwesomeIcon onClick={() => speak( "When did it live?" )} icon={faVolumeHigh} className={styles.audioIcon}/>
            </div>
            <div className={styles.tooltip}>{info}
                <span className={styles.tooltiptext}>A timeline of when {data.label} was alive, scroll horizontally to learn more</span>
            </div>
          </div>

            {/* start of what was added by group 22 */}
              <TimelineWidget identifier = {ID} timelineID = {"widget"}/>
            {/* end of what was added by group 22 */}
       
        </div>
        </main>
      </div>
   
      <main className={styles.wrapperRow}>
      {expandedText && (
                <div style={accOn ? fontStyles(fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize) : null} className={styles.expandContainer}>  
                <main className={styles.wrapper}>
                <div className={styles.expand}>
                  <button onClick={() => textExpand(false)}>{minimise}</button>
                  <div className={styles.audioContainer}>
                    <h1 className={styles.title}>{data.label}</h1>
                    <FontAwesomeIcon onClick={() => speak( data.label )} icon={faVolumeHigh} className={styles.audioIcon}/>
                  </div>
                 <div>{
                  }
                   { data.shortDescription ?
                   <ArticleContent>
                     {data.shortDescription}
                   </ArticleContent> : null }

                   { data.description ?
                   <ArticleContent>
                     {data.description}
                   </ArticleContent> : null}
                 </div>
               </div>
               </main>
               </div>
      )}


      {expandedTree && (
          <div style={accOn ? fontStyles(fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize) : null} className={styles.expandContainer}>  
           <main className={styles.wrapper}>
           <div className={styles.expand}>
             <button onClick={() => treeExpand(false)}>{minimise}</button>
              <div className={styles.audioContainer}>
                <h1> "How can it be classified?" </h1>
                <FontAwesomeIcon onClick={() => speak( "How can it be classified?" )} icon={faVolumeHigh} className={styles.audioIcon}/>
              </div>
              <Widget qNumber={ID} larger={true} />
              </div>
              </main>
            </div>
      )}

      {expandedTimeline && (
              <div style={accOn ? fontStyles(fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize) : null} className={styles.expandContainer}>  
              <main className={styles.wrapper}>
              <div className={styles.expand}>
              <button onClick={() => timelineExpand(false)}>{minimise}</button>
                <div className={styles.audioContainer}>
                  <h1> When did it live? </h1>
                  <FontAwesomeIcon onClick={() => speak( "When did it live?" )} icon={faVolumeHigh} className={styles.audioIcon}/>
                </div>
                <TimelineWidget identifier = {ID} timelineID = {"expandedWidget"}/>
              </div>
              </main>

            </div>
      )}
      {expandedMap && (
              <div style={accOn ? fontStyles(fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize) : null} className={styles.expandContainer}>  
              <main className={styles.wrapper}>
              <div className={styles.expand}>
              <button onClick={() => mapExpand(false)}>{minimise}</button>
              <div className={styles.audioContainer}>
                <h1> Where can you find it? </h1>
                <FontAwesomeIcon onClick={() => speak( "Where can you find it?" )} icon={faVolumeHigh} className={styles.audioIcon}/>
              </div>
              <MapWidget fossilID = {ID}></MapWidget>
              </div>
              </main>

            </div>
      )}

      
</main>
    <Footer/>
        
    </div>

   


  );

}
