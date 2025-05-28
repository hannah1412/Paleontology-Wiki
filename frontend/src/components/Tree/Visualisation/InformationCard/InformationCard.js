import React, { useState, Fragment, useEffect, useContext } from "react";
import { TreeContext } from "@/store/TreeContextProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnity } from "@fortawesome/free-brands-svg-icons";
import {
  faMagnifyingGlass,
  faArrowUp,
  faLocationCrosshairs,
  faSitemap,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import Link from "next/link";
import { TreeFontContext, fontStyles } from "@/store/TreeFontContextProvider";

import styles from "./InformationCard.module.css";

const InformationCard = () => {
  const { path, setPath, setRoot, setZoomFactor } = useContext(TreeContext);
  const [show, setShow] = useState(false);
  const [linksToSearch, setLinksToSearch] = useState();
  const node = path[0];
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
  const [isDropDownOpen, setDropDownOpen] = useState(false);

  const { fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize } =
    useContext(TreeFontContext);

  //Start of code adapted from Group 22
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };
  //End of code adapted from Group 22

  const scenes = ["Ceratosauria", "Coelophysoidea", "Cauropoda", "Cetanurae", "Chyreophora"]
  const [isSceneExist, setSceneExist] = useState(false);
  const [ gatheringScenes,setGatheringScene ] = useState(0)

  const handleDropDownToggle = () => {
    setDropDownOpen(!isDropDownOpen);
  };

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDR}/article/content?id=${node.data.id}`,
        );
        if (res.ok) {
          setLinksToSearch(true);
        } else {
          setLinksToSearch(false);
        }
      } catch (error) {}
    };
    fetchLinks();
  }, [path]);

  let headingStyle = fontStyles(
    fontSize + 0.35,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );
  let subHeadingStyle = fontStyles(
    fontSize + 0.15,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );
  let buttonFont = fontStyles(
    fontSize - 0.1,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );

  useEffect(() => {
    
    const gatherExistingScenes = () => {
      let currentScenes = [];
      if(node.data.children.length > 0){
        const lowerCaseScene = scenes.map(scene => scene.toLowerCase());
        node.children.forEach((child) => {
          if(lowerCaseScene.includes(child.data.name)){
            setSceneExist(true);
            currentScenes.push(child.data.name);
          }
        });
      }
      
      return currentScenes
    }
    const existScene = gatherExistingScenes()
    
    if(existScene.length > 0 ){
      setGatheringScene(existScene);
    }
    
  }, [node])

  return (

    <section
      style={{"maxWidth": `min(85%, ${fontSize*22.5}em)`}}
      className={
        reduceMotion === false
          ? `${styles.card} ${styles.animate_card} ${!show ? styles.hide : ""}`
          : `${styles.card} ${!show ? styles.hide : ""}`
      }
    >
      <button
        style={buttonFont}
        className={styles.toggle_button}
        onClick={() => {
          setShow(!show);
        }}
      >
        <FontAwesomeIcon
          icon={faArrowUp}
          className={`${styles.toggle_icon} ${!show ? "" : styles.flip}`}
        />
        {!show ? "Show Details" : "Hide Details"}
        <FontAwesomeIcon
          icon={faArrowUp}
          className={`${styles.toggle_icon} ${!show ? "" : styles.flip}`}
        />
      </button>

      <div className={styles.overflow}>
        <h1 style={headingStyle} className={styles.title}>
          {node.data.name}
          <button className={styles.audio} onClick={() => speak(node.data.name)}>
            <FontAwesomeIcon icon={faVolumeHigh} style={headingStyle} />
          </button>
        </h1>

        <h2 style={subHeadingStyle} className={styles.type}>
          Type: {node.data.taxon_rank}
        </h2>

        {path.length > 1 && (
          <Fragment>
            <p style={buttonFont} className={styles.parent_title}>
              Parent:
            </p>
            <ul style={buttonFont} className={styles.parent_list}>
              {path.map((node, index) => {
                if (index === 0) return;
                if (index >= 6) return;
                return (
                  <li
                    key={index}
                    onClick={() => {
                      setPath(node);
                    }}
                  >
                    {node.data.name}
                  </li>
                );
              })}
              {path.length > 6 && (
                <li
                  onClick={() => {
                    setPath(path[path.length - 1]);
                  }}
                >
                  ...{path[path.length - 1].data.name}
                </li>
              )}
            </ul>
          </Fragment>
        )}

        {node.data.children.length > 0 && (
          <Fragment>
            <p style={buttonFont} className={styles.children_title}>
              Children:
            </p>
            <ul style={buttonFont} className={styles.children_list}>
              {node.children.map((child, index) => {
                if (index >= 5) return;
                return (
                  <li
                    key={index}
                    onClick={() => {
                      setPath(child);
                    }}
                  >
                    {child.data.name}
                  </li>
                );
              })}
            </ul>
          </Fragment>
        )}

        <div
          className={
            reduceMotion === false
              ? `${styles.actions} ${styles.animate_motion}`
              : `${styles.actions}`
          }
        >
          <button
            style={buttonFont}
            onClick={() => {
              if (node.data.in_base) setRoot(node.data.id);
            }}
            className={node.data.in_base ? "" : styles.inactive_button}
          >
            <FontAwesomeIcon icon={faSitemap} className={styles.icon} /> Set as
            root
          </button>

          <button
            onClick={() => {
              setPath(node);
            }}
            style={buttonFont}
          >
            <FontAwesomeIcon
              icon={faLocationCrosshairs}
              className={styles.icon}
            />{" "}
            Re-center
          </button>

          <button
            onClick={() => {
              if (linksToSearch) {
                window.open(`/result?id=${node.data.id}`, "_same");
              }
            }}
            className={linksToSearch ? "" : styles.inactive_button}
            style={buttonFont}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.icon} />{" "}
            Learn More
          </button>

          <button style={buttonFont} onClick={handleDropDownToggle}>
            <FontAwesomeIcon icon={faUnity} className={styles.icon} />
            Visualise
          </button>
          {isDropDownOpen && (
            <div className={`${styles.dropdownContent}`}>
              {/* {gatheringScenes && (
                gatheringScenes.map((scene) => {
                  <Link target="_blank" href={`/cladogram/${scene}`}>
                    {scene}
                  </Link>
                })
              )} */}
              <Link target="_blank" href="/cladogram/3dmodels" style={buttonFont}>Example scene</Link>
              <Link target="_blank" href="/cladogram/Ceratosauria" style={buttonFont}>Ceratosauria</Link>
              <Link target="_blank" href="/cladogram/Coelophysoidea" style={buttonFont}>Coelophysoidea</Link>
              <Link target="_blank" href="/cladogram/Sauropoda" style={buttonFont}>Sauropoda</Link>
              <Link target="_blank" href="/cladogram/Tetanurae" style={buttonFont}>Tetanurae</Link>
              <Link target="_blank" href="/cladogram/Thyreophora" style={buttonFont}>Thyreophora</Link>
            </div>
          )}
        </div>
      </div>
    </section>

  );
};
export default InformationCard;
