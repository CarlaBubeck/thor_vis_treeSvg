import * as d3 from "d3";
import { updateRadial } from "./index.mjs";

const CONFIG = {
  SORT: true,
};

let data;

let selectedCase;

let worstCase;
let bestCase;

let minValue;
let maxValue;

let colorScale;

export function drawBarChart(dataIn) {
  const container = d3.select("body");

  data = dataIn;

  const width = 500;
  const height = 550;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const svg = container
    .append("svg")
    .attr("id", "chart")
    .attr("width", width)
    .attr("height", height);

  const chartGroup = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  if (CONFIG.SORT) {
    data = d3.sort(data, (d) => d.value);
  }

  const x = d3
    .scaleBand()
    .domain(data.map((d) => `Case ${d.case}`))
    .range([-chartWidth / 2 + margin.left, chartWidth / 2 - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .nice()
    .range([chartHeight / 2 - margin.bottom, -chartHeight / 2 + margin.top]);

  colorScale = d3.scaleSequential([0, 100], d3.interpolateRdYlGn);

  chartGroup.append("g").attr("class", "bars"); // group for bars

  chartGroup
    .append("g")
    .attr("transform", `translate(0,${y(0)})`)
    .call(d3.axisBottom(x));

  chartGroup
    .append("g")
    .attr("transform", `translate(${x.range()[0]},0)`)
    .call(d3.axisLeft(y));

  // y axis label
  chartGroup
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .attr("x", 0)
    .attr("y", x.range()[0] - 35)
    .style("font-size", "12px")
    .text("Passengers / 100kg CO2");

  // smart default: select case with highest value on first load
  //let selectedCase = data.reduce((a, b) => (a.value > b.value ? a : b)).case;

  selectedCase = data.reduce((a, b) => (a.value > b.value ? a : b)).case;

  minValue = d3.min(data, (d) => d.value);
  maxValue = d3.max(data, (d) => d.value);

  worstCase = data.find((d) => d.value === minValue);
  bestCase = data.find((d) => d.value === maxValue);

  renderBars(selectedCase);
  createResizableSVG(container);

  function renderBars(activeCase) {
    // Remove any existing tooltip
    chartGroup.selectAll(".tooltip").remove();

    chartGroup
      .select(".bars")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(`Case ${d.case}`))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.value))
      .attr("fill", (d) => colorScale(d.value))
      .style("stroke", (d) => (d.case === activeCase ? "#000" : "none"))
      .style("stroke-width", "2px")
      .on("click", (event, d) => {
        selectedCase = d.case;
        renderBars(selectedCase); // re-render
        handleBarClick(d);
      });

    // If the selected case is the highest bar, show tooltip
    if (activeCase === worstCase.case) {
      chartGroup
        .append("text")
        .attr("class", "tooltip")
        .attr("x", x(`Case ${worstCase.case}`) + x.bandwidth() / 2)
        .attr("y", y(worstCase.value) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        //.style("font-weight", "bold")
        .text("☹️");
    } else if (activeCase === bestCase.case) {
      chartGroup
        .append("text")
        .attr("class", "tooltip")
        .attr("x", x(`Case ${bestCase.case}`) + x.bandwidth() / 2)
        .attr("y", y(bestCase.value) - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        //.style("font-weight", "bold")
        .text("😊");
    }
  }
}

function handleBarClick(d) {
  console.log("clicked", d);
  // show new radial graph, random for now
  // TBD connect to actual data of case (read d)
  //updateRadial();
  updateSVG();
}

export function isWorstCaseSel() {
  console.log(selectedCase == worstCase.case);
  return selectedCase == worstCase.case;
}

function createResizableSVG(container) {
  // Create container for the resizable SVG
  const svgContainer = container
    .append("div")
    .attr("id", "svg_container")
    .style("margin-top", "20px")
    .style("text-align", "center");

  //svgContainer.append("svg").attr("id", "tree_svg").attr("src", "src/tree.svg");

  const svg = svgContainer
    .append("svg")
    .attr("id", "tree_svg")
    .attr("width", 200)
    .attr("height", 200);

  // Load the SVG file content
  d3.xml("src/tree.svg").then((data) => {
    // Insert the loaded SVG content
    const importedNode = document.importNode(data.documentElement, true);
    svg.node().appendChild(importedNode);

    // Remove all inline styles from the imported SVG
    svg.selectAll("*").each(function () {
      this.removeAttribute("style");
    });

    // Now you can apply fill and other attributes
    // svg.attr("fill", colorScale(someValue));
  });

  // Initial update
  updateSVG();
}

function updateSVG() {
  // const selectedCaseData = data.find((d) => d.case === selectedCase);
  // if (!selectedCaseData) return;

  console.log(data);
  const selectedCaseData = data.find((d) => d.case === selectedCase).value;
  // Calculate size based on the selected case value
  // Lower values = smaller size, higher values = larger size
  // const minValue = d3.min(data, (d) => d.value);
  // const maxValue = d3.max(data, (d) => d.value);
  const minSize = 100; // Minimum SVG size
  const maxSize = 300; // Maximum SVG size

  // Create a scale for sizing (higher values = larger size)
  const sizeScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([minSize, maxSize]);

  const svgSize = sizeScale(selectedCaseData);

  // Update the img element size
  const img = d3.select("#tree_svg");

  console.log(svgSize);

  img
    .transition()
    .duration(300)
    .ease(d3.easeQuadOut)
    .attr("width", svgSize)
    .attr("height", svgSize)
    .attr("fill", colorScale(selectedCaseData));
}
