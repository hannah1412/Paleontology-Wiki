import React,{ useRef, useEffect, ChangeEvent, LegacyRef } from "react";

import styles from "./Card.module.css";

export default function HidableCard(props: {show: boolean, children: any, style?: any, className?: string, onClickOutside?: () => void}) {
    // adapted from https://blog.logrocket.com/detect-click-outside-react-component-how-to/
    const ref: {current: HTMLElement | undefined} = useRef();
    const { onClickOutside } = props;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            onClickOutside && onClickOutside();
        }
        };
        document.addEventListener('click', handleClickOutside, true);
        return () => {
        document.removeEventListener('click', handleClickOutside, true);
        };
    }, [ onClickOutside ]);

    if(!props.show)
        return null;

    return (
        <div ref={ref as LegacyRef<HTMLDivElement>} style={props.style} className={`${styles["card"]} ${props.className ? props.className : ""}`}>
            {props.children}
        </div>
  );
}
