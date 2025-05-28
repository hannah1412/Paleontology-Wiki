'use client';

import { SearchResponse } from '@/search/types';
import 'react';
import styles from '@/components/Search/SearchPage.module.css'
import Link from 'next/link';

export default function RecommendationsList(props: {items: SearchResponse}) { 
    // Gets a list of suggested articles
    return (
        <ul style={{listStyleType: "none", display:"flex",flexDirection:"row",flexGrow:1,flexWrap:"wrap"}}>
        {props.items.map((item,idx) => (
            <li key={idx} style={{flex:7, display: "inline"}}> <Link href={{
              pathname: '/result', query: {
                id: item.id,
              },
            }}><div className={styles.title} >{item.label}</div></Link><p><div className={styles.normalText}>{item.shortDescription}</div></p></li>
        ))}
        </ul>
    )
}
