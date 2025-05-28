'use client';

import 'react'
import Card from '@/components/UI/Card.js';
import styles from './LinkBox.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {LinkData} from '@/search/types';
import { Black_And_White_Picture } from 'next/font/google';

export default function LinksBox(props: {links: Array<LinkData>}) {
   /* Getting the link to Wikipedia */
  const external_link = <FontAwesomeIcon icon={faArrowUpRightFromSquare}style={{fontSize: '3.2rem', color: 'var(--brand-900)'}} />
  const listItems = props.links.map((link,idx) =>
    <li key={idx}>
      <a href={link.url}>{external_link}</a>
    </li>
  );

  return (
    <ul className={styles.list}>
      {listItems}
    </ul>
  );
}
