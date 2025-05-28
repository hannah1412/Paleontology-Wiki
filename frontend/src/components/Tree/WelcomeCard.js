import React, { useContext } from "react";
import { useSelector } from "react-redux";
import Card from "@/components/UI/Card";
import { TreeFontContext, fontStyles } from "@/store/TreeFontContextProvider";
import styles from "./WelcomeCard.module.css";

const WelcomeCard = ({ setShowIntro }) => {
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
  const { fontSize, charSpaceSize, interWordSpaceSize, lineSpaceSize } =
    useContext(TreeFontContext);

  const headingStyle = fontStyles(
    fontSize + 1,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );
  const descriptionStyle = fontStyles(
    fontSize - 0.1,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );
  const buttonStyle = fontStyles(
    fontSize,
    charSpaceSize,
    interWordSpaceSize,
    lineSpaceSize,
  );

  // Display the welcome card until the user clicks the button
  // Contains a brief description of cladograms and the classification of dinosaurs
  // we provide.
  return (
    <Card className={styles.welcome}>
      <h1 style={headingStyle} className={styles.header}>
        Classifying Dinosaurs
      </h1>
      <p style={descriptionStyle} className={styles.description}>
        Understand the taxonomy of dinosaurs by exploring their clades and
        classifications on this family tree.
      </p>
      <p style={descriptionStyle} className={styles.description}>
        In the realm of dinosaurs, a clade is a group with a common ancestor and
        all its descendants. A cladogram, specific to dinosaurs, is a visual
        family tree illustrating the evolutionary links between species. It
        simplifies understanding their relationships and evolutionary journey.
      </p>
      <p style={descriptionStyle} className={styles.description}>
        The classification of dinosaurs is still widely debated to this day with
        experts constantly suggesting new groupings. Explore the cladograms of
        dinosaurs using three respected interpretations Benton,
        Weishampel/Dodson/Osmólska, and Baron/Norman/Barrett classifications.
      </p>

      <button
        style={buttonStyle}
        className={`${styles.button} ${!reduceMotion ? styles.animate_motion : ""}`}
        onClick={() => {
          setShowIntro(false);
        }}
      >
        Lets Explore!
      </button>
    </Card>
  );
};
export default WelcomeCard;
