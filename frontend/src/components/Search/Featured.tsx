'use client';

import 'react';
import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/components/Search/SearchPage.module.css'
import { FeaturedArticlesResponse } from '@/search/types';
import RecommendationsList from '@/components/Search/RecommendationsList';

const memoed = memo(function Featured(props: {n:number}) {
    //get url from backend
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_ADDR

    //declare data constant
    const [data, setData] = useState<FeaturedArticlesResponse>([]);
    

    //call the search API and get 5 images for data
    const callFeaturedAPI = (n: number) => {
          const url = API_URL + "/article/featured" + "?n=" + n;
          fetch(url)
          .then((res) => res.json())
          .then((d) => setData(d));
    };

    //call function passing in the search input
    useEffect(() => {
      callFeaturedAPI(props.n);
    }, [props])


    return (
      <RecommendationsList items={data}/>
    )
})

export default memoed;
