'use client';

import 'react';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './SearchPage.module.css';
import { Image, SearchResponse} from '@/search/types';

export default function SearchList(props: {searchInput:string}) {
  //get url from backend
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_ADDR

  //declare constants for image and whether image is open
  const [openedImage, imageOpen] = useState(false);
  const [image, setImage] = useState<Image | undefined>(undefined);

  //declare data constant
  const [data, setData] = useState<SearchResponse>([]);

  //declare search input and whether it is hidden
  const {searchInput} = props;

  //call the search API and get 5 images for data
  const callSearchAPI = (term: string) => {
        const url = API_URL + "/search?q=" + term + "&total=" + 5;
        fetch(url)
        .then((res) => res.json())
        .then((d) => setData(d));
  };

  //call function passing in the search input
  useEffect(() =>{
    callSearchAPI(searchInput);
  }, [searchInput])

  if (searchInput == null || searchInput.length == 0) {
    return (
    <div>
      {/* Empty on Purpose */}
    </div>
    )
  }
  else if (data.length != 0) {
  return (
  
    <div className={styles.listContainer}>
    {/* Container of outputting the list of results */}
    <ul style={{listStyleType: "none", display:"flex",flexDirection:"column",flexGrow:1, flexBasis:"100%", width:"100%"}}>
      {/* map and print each of the data results */}
      {data.map((item,idx) => (
        <div key={idx} style={{ display: "flex",flexGrow:1}}>
          <li key={idx} style={{flex:7}}> <Link href={{
            pathname: '/result', query: {
              id: item.id,
              label: item.label,
              short_description: item.shortDescription
            },
            }}><div className={styles.title} >{item.label}</div></Link><p>{item.shortDescription}</p>
          </li>
          <a style={{flex:3,display:"flex",justifyContent:"flex-end"}}>

            <img
              src={item.image?.url}
              height={65}
              className={styles.resultImage}
              onClick={() => {imageOpen(true);setImage(item.image)}}
            />
            
            {/* Allowing expansion of images */}
            {openedImage && (
                <div>
                    <div className={styles.containerImage}>
                      <figure className={styles.fig}>  
                        <img className={styles.expandedImage} src={image?.url ?? undefined}></img>
                        {image?.altText ? <figcaption className={styles.figcap}>{image?.altText || ""}</figcaption> : null}
                        <button className={styles.closeButton} onClick={() => imageOpen(false)}>x</button>
                      </figure>
                    </div>
                </div>
            )}
          </a>
        </div>
      ))}
    </ul>
    </div>
    )}
    
    else {
      return (
        <div className={styles.noResults}> No Results Found </div>
      )
    }
}
