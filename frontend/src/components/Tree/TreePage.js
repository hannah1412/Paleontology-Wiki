"use client";

import React, { Fragment, useState } from "react";
import Visualisation from "@/components/Tree/Visualisation//Visualisation";
import WelcomeCard from "@/components/Tree/WelcomeCard";
import TreeContextProvider from "@/store/TreeContextProvider";
import TreeFontContextProvider from "@/store/TreeFontContextProvider";
import Footer from "@/components/UI/Footer";

const TreePage = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <TreeContextProvider>
      <TreeFontContextProvider>
        {showIntro ? (
          <WelcomeCard setShowIntro={setShowIntro} />
        ) : (
          <Fragment>
            <Visualisation setShowIntro={setShowIntro} />
            <Footer />
          </Fragment>
        )}
      </TreeFontContextProvider>
    </TreeContextProvider>
  );
};
export default TreePage;
