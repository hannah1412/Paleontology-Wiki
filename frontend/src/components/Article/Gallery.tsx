'use client';
import { useState, useRef } from 'react';
import styles from './Gallery.module.css';
import {Image} from '@/search/types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownLeftAndUpRightToCenter} from "@fortawesome/free-solid-svg-icons";

export default function Gallery(props: { images: Image[] }) {

  //declaring array for non blank images
  const properImages: number[] = [];
  const tif = new RegExp("$"+".tif")
  const pdf = new RegExp("$"+".pdf")
  //first non-blank image
  var first = check();
  const [properIndex, setProperIndex] = useState(first);

  //declare constants for image and whether image is open
  const [openedImage, imageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<Image>({url:"",altText:""});

  //set whether the current image index
  function changeImage(index: number) {
    setProperIndex(properImages.indexOf(index));
  };
  
  function check() {
    for (let i = 0; i < props.images.length; i++) {
      if (
        (props.images[i]?.url != "https://upload.wikimedia.org/wikipedia/commons/8/8a/OOjs_UI_icon_edit-ltr.svg") 
      && (props.images[i]?.url != "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Merge-arrows.svg/100px-Merge-arrows.svg") 
      && (props.images[i]?.url != pdf.toString()) && (props.images[i]?.url != tif.toString())) {
        properImages.push(i);
      }
    }
    var first = properImages[0];
    return first;
  }
  //change the image to the next image
  function nextImage() {
    if (properIndex < properImages.length - 1) {
      setProperIndex(properIndex + 1);
    } 
    else {
      setProperIndex(0);
    }
  }

  //change the image to the previous image
  function prevImage() {
    if (properIndex > 0) {
      setProperIndex(properIndex - 1);
    } 
    else {
      setProperIndex(properImages.length - 1);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ float: 'left' }}>
        <button className={styles.navButton} onClick={prevImage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" /></svg>
        </button>
      </div>
        {/* Each of the entity's images at the large size */}
      <div className={styles.imageWrapper} style={{ float: 'left' }}>
        <div>
          <a>
            <div className={styles.imageBox}>  
              <img 
                src={(props.images.length == 0 
                  || (props.images.every(image => 
                     image.url == "https://upload.wikimedia.org/wikipedia/commons/8/8a/OOjs_UI_icon_edit-ltr.svg"
                  || image.url == "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Merge-arrows.svg/100px-Merge-arrows.svg"
                  || image.url == pdf.toString() 
                  || image.url == tif.toString()))) ? "img/imageNotFound.png" : props.images[properImages[properIndex]]?.url}
                onClick={() => {imageOpen(true);setImageSrc(props.images[properImages[properIndex]])}} 
                style={{margin: '2px', width:400}} 
                alt=""
                className={styles.resultImage}
                title={props.images[properImages[properIndex]]?.url ? '' : 'Image Not Found'}
              />
            </div>
              {/* Expanded version of an image */}
            {openedImage && (
              <div className={styles.containerImage}>  
                <figure className={styles.fig}> 
                  <div>
                    <div style={{ float: 'left' }}><button className={styles.navButtonExpanded} onClick={prevImage}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" /></svg></button></div>
                    <div style={{ float: 'left' }} className={styles.imageBox}><img title={props.images[properImages[properIndex]]?.url ? '' : 'Image Not Found'} className={styles.expandedImage} src={props.images[properImages[properIndex]]?.url || "img/imageNotFound.png"}></img></div>
                    <div style={{ float: 'right' }}><button className={styles.navButtonExpanded} onClick={nextImage}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" /></svg></button></div>
                    {props.images[properImages[properIndex]]?.altText ? <figcaption className={styles.figcap}>{props.images[properImages[properIndex]]?.altText || ""}</figcaption> : null}
                    <a className={styles.wrapper_button} onClick={() => imageOpen(false)}><FontAwesomeIcon icon={faDownLeftAndUpRightToCenter}style={{fontSize: '1.3rem'}} /></a>
                  </div>
                </figure>
              </div>
            )}
          </a>
        </div>
          {/* Panel with the smaller images */}
        <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
          {properImages.map((index) => (
            <a className={styles.thumbnail} key={index}><img src={props.images[index].url} onClick={() => changeImage(index)} width={70} key={index} style={{ margin: '5px'}} alt="" /></a>  //REMOVE ONCLICK
          ))}
        </div>
      </div>
        {/* Navigation left to right between images */}
      <div style={{ float: 'left' }}>
        <button className={styles.navButton} onClick={nextImage}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" /></svg>
        </button>
      </div>
    </div>
  )
}