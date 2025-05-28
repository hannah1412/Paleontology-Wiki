import React, { useContext, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import ReactECharts from "echarts-for-react";
import { TreeContext } from "@/store/TreeContextProvider";
import { ThemeContext } from "@/store/ThemeContextProvider";

const TreeChart = () => {
  const { radialData } = useContext(TreeContext);
  const { theme } = useContext(ThemeContext);
  const reduceMotion = useSelector((state) => state.accessibility.reduceMotion);
  const [labelOption, setLabelOption] = useState({
    fontSize: 20,
    fontFamily: "Helvetica Neue",
    color: theme === "dark" ? "#E8EDF8" : "#001234",
  });
  const [lineStyleOption, setLineStyleOption] = useState({
    color: theme === "dark" ? "#83A1F37F" : "#1131877F",
  });
  const [treeMotionOption, setTreeMotionOption] = useState();
  const chartRef = useRef();
  const [expandOption, setExpandOption] = useState();

  useEffect(() => {
    // Setting how nodes and line on tree are styled
    setLabelOption({
      fontSize: 20,
      fontFamily: "Helvetica Neue",
      color: theme === "dark" ? "#E8EDF8" : "#001234",
    });
    setLineStyleOption({
      color: theme === "dark" ? "#83A1F37F" : "#1131877F",
    });
  }, [theme]);

  useEffect(() => {
    setTreeMotionOption(reduceMotion !== true);
    setExpandOption(reduceMotion === false);
  }, [reduceMotion]);

  useEffect(() => {
    let instance = chartRef.current.getEchartsInstance();
  }, []);

  // Uses echarts and its react wrapper to create and style radial tree from data
  const eChartsOption = {
    animation: treeMotionOption,
    aria: {
      label: {
        enabled: true,
        description:
          "A cladogram showing the classifications of dinosaurs in the form of a radial tree diagram",
      },
    },
    series: [
      {
        type: "tree",
        data: [radialData],
        label: labelOption,
        top: "0%",
        bottom: "0%",
        center: ["0%", "15%"],
        roam: "move",
        expandAndCollapse: expandOption,
        labelLayout: {
          hideOverlap: true,
        },
        layout: "radial",
        symbol: "emptycircle",
        symbolSize: 8,
        animationDurationUpdate: 750,
        initialTreeDepth: 1,
        emphasis: {
          focus: "self",
        },
        lineStyle: lineStyleOption,
      },
    ],
  };

  const style = {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };

  return <ReactECharts option={eChartsOption} style={style} ref={chartRef} />;
};
export default TreeChart;
