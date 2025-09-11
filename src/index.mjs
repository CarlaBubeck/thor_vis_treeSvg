//import * as d3 from "d3";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const response = await fetch("./data/data_scenario_1.json");
const caseDataS1 = await response.json();
const response2 = await fetch("./data/data_scenario_2.json");
const caseDataS2 = await response2.json();
const response3 = await fetch("./data/data_scenario_3.json");
const caseDataS3 = await response3.json();
const response4 = await fetch("./data/data_scenario_4.json");
const caseDataS4 = await response4.json();
const response5 = await fetch("./data/data_scenario_5.json");
const caseDataS5 = await response5.json();

const minValue = 0;
const maxValue = 100;

const colorScale = d3.scaleSequential(
  [minValue, maxValue],
  d3.interpolateRdYlGn
);

const bar_colors = [
  "#F9B2FF",
  "#D7BAFF",
    "#A8BCFF",
      "#99D8FF",
        "#A8FCFF"
];

const colorScaleTree = d3
  .scaleSequential()
  .domain([minValue, maxValue])
  .interpolator(d3.interpolateRgb("#854a03", "#34c408")); // brown to green


  const colorScaleTreeS1 = d3
  .scaleSequential()
  .domain([minValue, maxValue])
  .interpolator(d3.interpolateRgb("#6b3c04ff", "#2a9c07ff"));



  const colorScaleTreeS2 = d3
  .scaleSequential()
  .domain([minValue, maxValue])
  .interpolator(d3.interpolateRgb("#623703ff", "#1b7200ff"));


const ALL_DATASETS = [
  caseDataS1,
  caseDataS2,
  caseDataS3,
  caseDataS4,
  caseDataS5,
];
const CONFIG = { SORT: false };
const TOTAL_CASES = 5;

let finalizedSelections = [];

initApp();

function updateURL(selections) {
  const url = new URL(window.location);
  url.searchParams.set("selections", selections.join("-"));
  history.replaceState(null, "", url);
  sendChoiceToParent(selections);
}

function sendChoiceToParent(choice) {
  console.log("message sent to parent with value: " + choice);
  window.parent.postMessage({ choiceValue: choice }, "*");
}

function getSelectionsFromURL() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("selections");
  return raw ? raw.split("-").map(Number) : [];
}

export async function initApp() {
  // Layout setup
  const layout = d3.select("body").append("div").attr("id", "layout");

  layout.append("div").attr("id", "tree-grid");
  layout.append("div").attr("id", "bar-interaction");

  finalizedSelections = getSelectionsFromURL();

  console.log(finalizedSelections);

  for (let i = 0; i < finalizedSelections.length; i++) {
    drawFinalTreeOnly(ALL_DATASETS[i], finalizedSelections[i], i);
  }

  if (finalizedSelections.length < TOTAL_CASES) {
    const step = finalizedSelections.length;
    drawBarChartWithPreview(ALL_DATASETS[step], step);
  }
}

function drawBarChartWithPreview(dataIn, step) {
  const container = d3.select("#bar-interaction");
  container.html(""); // Clear any previous step

  const data = CONFIG.SORT ? d3.sort([...dataIn], (d) => d.value) : [...dataIn];
  const width = 400;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  let selectedCase = data.reduce((a, b) => (a.value > b.value ? a : b)).case;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chartGroup = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const x = d3
    .scaleBand()
    // .domain(data.map((d) => `Case ${d.case}`))
    .domain(data.map((d) => d.case))
    .range([-chartWidth / 2 + margin.left, chartWidth / 2 - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([chartHeight / 2 - margin.bottom, -chartHeight / 2 + margin.top]);

  chartGroup.append("g").attr("class", "bars");

  const xAxis = chartGroup
    .append("g")
    .attr("transform", `translate(0,${y(0)})`)
    .call(d3.axisBottom(x).tickFormat(""));

    xAxis.selectAll(".tick line").remove();

  chartGroup
    .append("g")
    .attr("transform", `translate(${x.range()[0]},0)`)
    .call(d3.axisLeft(y));

  renderBars();

  function renderBars() {
    chartGroup.selectAll(".tooltip").remove();
    

    // bars
    let bars = chartGroup
      .select(".bars")
      .selectAll("rect.top")
      .data(data)
      .join("rect")
      .attr("class", "top")
      // .attr("x", (d) => x(`Case ${d.case}`))
      .attr("x", (d) => x(d.case))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.value))
      // .attr("fill", (d) => colorScale(d.value))
      .attr("fill", (d) => bar_colors[parseInt(d.case) - 1])
      .style("stroke", (d) => (d.case === selectedCase ? "#000" : "none"))
      .style("stroke-width", "2px")
      .on("click", (event, d) => {
        selectedCase = d.case;
        renderBars();
        // updateSVG(data, selectedCase, step, colorScale, minValue, maxValue);
        updateSVG(data, selectedCase, step);

        // send choice to pt survey
        // finalizedSelections.push(selectedCase);
        sendChoiceToParent(selectedCase);
      });

      // text label
      chartGroup
          .select(".bars")
          .selectAll("text")
          .data(data)
          .join("text")
          .text(d => d.value)
          .attr("x", d => x(d.case) + x.bandwidth() / 2)  // center text on bar
          .attr("y", d => y(d.value) - 5) // slightly above the top of the bar
          .attr("text-anchor", "middle")
          .attr("fill", "#000")
          .style("font-size", "12px")
          .style("pointer-events", "none");  // so clicks pass through labels to bars
        };


      // traffic light indicatos underneath bars
      let bottombars = chartGroup
      .select(".bars")
      .selectAll("rect.bottom")
      .data(data)
      .attr("class", "bottom")
      .join("rect")
      .attr("x", (d) => x(d.case))
      .attr("y", y(0) + 5)
      .attr("width", x.bandwidth())
      .attr("height", 10)
      .attr("fill", (d) => colorScale(d.value));

  const treeGrid = d3.select("#tree-grid");

  const previewSvg = treeGrid
    .append("svg")
    .attr("id", `tree_svg_${step}`)
    .attr("class", "tree_svg")
    .attr("width", 200)
    .attr("height", 200);

  d3.xml("./newtreev2.svg").then((dataXml) => {
    const importedNode = document.importNode(dataXml.documentElement, true);
    previewSvg.node().appendChild(importedNode);

    previewSvg.selectAll("*").each(function () {
      this.removeAttribute("style");
    });

    // updateSVG(data, selectedCase, step, colorScale, minValue, maxValue);
    updateSVG(data, selectedCase, step);
  });

  // container
  //   .append("button")
  //   .text("Finalize selection")
  //   .style("margin-top", "10px")
  //   .on("click", () => {
  //     // finalizedSelections.push(selectedCase);
  //     // sendChoiceToParent(finalizedSelections);


  //     // finalizedSelections.push(selectedCase);
  //     // updateURL(finalizedSelections);
  //     // //drawFinalTreeOnly(data, selectedCase, step);
  //     // container.html(""); // clear bar interaction

  //     // if (finalizedSelections.length < TOTAL_CASES) {
  //     //   drawBarChartWithPreview(
  //     //     ALL_DATASETS[finalizedSelections.length],
  //     //     finalizedSelections.length
  //     //   );
  //     // }
  //   });
}

function drawFinalTreeOnly(data, selectedCase, step) {
  const container = d3.select("#tree-grid");

  const svg = container
    .append("svg")
    .attr("id", `final_tree_${step}`)
    .attr("class", "tree_svg");

  d3.xml("./newtreev2.svg").then((dataXml) => {
    const importedNode = document.importNode(dataXml.documentElement, true);
    svg.node().appendChild(importedNode);

    svg.selectAll("*").each(function () {
      this.removeAttribute("style");
    });

    updateSVG(data, selectedCase, step);
  });
}

function updateSVG(data, selectedCase, step) {
  const selectedData = data.find((d) => d.case === selectedCase);
  if (!selectedData) return;

  const sizeScale = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .range([100, 300]);

  const svgSize = sizeScale(selectedData.value);


  // size
  d3.select(`#tree_svg_${step}, #final_tree_${step}`)
    .transition()
    .duration(300)
    .ease(d3.easeQuadOut)
    .attr("width", svgSize)
    .attr("height", svgSize);
    // .attr("fill", colorScaleTree(selectedData.value));

// d3.select(`#tree_svg_${step}, #final_tree_${step}`)
//   .select("path:nth-of-type(4)")  // Select the third path inside the SVG(s)
//   .transition()
//   .duration(300)
//   .ease(d3.easeQuadOut)
//   .attr("fill", colorScaleTree(selectedData.value));

// // shadow
//   d3.select(`#tree_svg_${step}, #final_tree_${step}`)
//   .select("path:nth-of-type(5)")  // Select the third path inside the SVG(s)
//   .transition()
//   .duration(300)
//   .ease(d3.easeQuadOut)
//   .attr("fill", colorScaleTree(Math.max(0, selectedData.value - 5)));


  let baseColor = colorScaleTree(selectedData.value);
  let shadeColor1 = colorScaleTreeS1(Math.max(0, selectedData.value));
  let shadeColor2 = colorScaleTreeS2(Math.max(0, selectedData.value));

  changePathColor(step, 8, baseColor);
  changePathColor(step, 9, baseColor);
  changePathColor(step, 10, baseColor);

  changePathColor(step, 4, shadeColor2);
  changePathColor(step, 5, shadeColor2);
  changePathColor(step, 6, shadeColor2);
  changePathColor(step, 7, shadeColor2);

  changePathColor(step, 3, shadeColor1);

}


function changePathColor(step, pathID, color) {

  console.log(pathID, color)

  d3.select(`#tree_svg_${step}, #final_tree_${step}`)
  .select(`path:nth-of-type(${pathID})`)  // Select the third path inside the SVG(s)
  .transition()
  .duration(300)
  .ease(d3.easeQuadOut)
  .attr("fill", color);
}
