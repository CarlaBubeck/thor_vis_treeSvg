import "./styles.css";
import * as d3 from "d3";
import { drawBarChart, isWorstCaseSel } from "./barchart.mjs";
import { drawRadialChart } from "./radialchart.mjs";
import caseData from "./caseData.json";

const CONFIG = {
  CASES: 5,
  IMAGES: {
    PRE_IMG: "src/preForest.svg",
    POST_IMG: "src/postForest.svg",
  },
  TRANSITION_DELAY: 1300,
  SUCCESS_MESSAGE:
    "Great, you chose the most sustainable case. A tree has been added to your forest!",
};

// initialise case data
// function newCaseData() {
//   const data = [];
//   for (let i = 1; i < CONFIG.CASES + 1; i++) {
//     data.push({ case: i, value: Math.floor(Math.random() * 81) + 10 }); // range 10-90
//   }
//   return data;
// }
//const caseData = newCaseData();

// drawBarChart(caseData);

import { initApp } from "./bar_tree.mjs";
import dataset from "./data.json"; // or wherever your data comes from

initApp();

// // initialise hourly data
// function newHourlyData() {
//   const data = [];
//   for (let i = 1; i < 25; i++) {
//     data.push({ hour: i, value: Math.floor(Math.random() * 100) });
//   }
//   return data;
// }
// const hourlyData = newHourlyData();
// drawRadialChart(hourlyData);

// // update radial data to show new graph
// export function updateRadial() {
//   const hourlyData = newHourlyData();
//   drawRadialChart(hourlyData);
// }

// send button functionality
// const button = document.getElementById("sendButton");

// button.onclick = function () {
//   console.log(isWorstCaseSel());
// };

// function drawOverlay() {
//   const overlay = document.createElement("div");
//   overlay.id = "overlay";

//   const preImg = document.createElement("img");
//   preImg.src = CONFIG.IMAGES.PRE_IMG;
//   overlay.appendChild(preImg);

//   const postImg = document.createElement("img");
//   postImg.src = CONFIG.IMAGES.POST_IMG;
//   postImg.className = "hide";
//   overlay.appendChild(postImg);

//   const successText = document.createElement("p");
//   successText.className = "hide";
//   successText.innerHTML = CONFIG.SUCCESS_MESSAGE;
//   overlay.appendChild(successText);

//   //  transition
//   setTimeout(() => {
//     [postImg, successText].forEach((element) => {
//       element.classList.remove("hide");
//       element.classList.add("active");
//     });
//   }, CONFIG.TRANSITION_DELAY);

//   document.body.appendChild(overlay);

//   // click anywhere to close overlay
//   overlay.onclick = function () {
//     overlay.remove();
//   };
// }
