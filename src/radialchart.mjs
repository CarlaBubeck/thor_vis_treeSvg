import * as d3 from "d3";

export function drawRadialChart(data) {
  d3.select("#radialChart").remove();

  const container = d3.select("body");
  //Ausmaße des Graphen festlegen
  const width = 500;
  const height = 400;
  const margin = 25;
  const innerRadius = 60;
  const outerRadius = Math.min(width, height) / 2 - margin; //um sicherzustellen, dass der Graph in unser Fenster passt, ist der äußere Radius abhängig von der Breite oder der Höhe des Fensters, je nachdem, welcher Wert kleiner ist

  //den Graphen (noch ohne Balken etc) erzeugen
  const svg = container
    .append("svg")
    .attr("id", "radialChart")
    .attr("width", width)
    .attr("height", height);

  //Skalen legen fest, wie ein gegebener Datenpunkt in einen graphischen Wert (z.B. x-Koordinate) umgerechnet werden soll. Der niedrigste Wert in Domain wird in den niedrigsten Wert in Range umgerechnet, der höchste Wert in den höchsten, und Werte dazwischen entsprechend.
  //die x-Koordinate ist in unserem Fall der innere Kreis, sie steht für die Stunde
  const scaleX = d3
    .scaleBand()
    .domain(data.map((d) => d.hour)) //Unser Datensatz besteht aus 24 Einträgen, ein Eintrag pro Stunde, unsere Domain kann die Werte 0,1,2,...,24 haben
    .range([0, 2 * Math.PI]); //unsere x-Koordinate bewegt sich zwischen 0 und einer vollständigen Umkreisung, in Bogenmaß ist das 2 mal pi

  //die y-Koordinate ist die Höhe eines Balkens, sie steht für den Öko-KPI
  const scaleY = d3
    .scaleRadial()
    .domain([0, Math.max(...data.map((d) => d.value))]) //die Datenpunkte können sich zwischen 0 und einem Maximum bewegen. Wir könnten hier auch einen festen Wert, z.B. 100, angeben
    .range([innerRadius, outerRadius]); //die Balken beginnen immer im inneren Kreis und können maximal bis zum äußeren Kreis

  //Beispiel für eine Farbskala
  const scaleC = d3.scaleSequential([0, 100], d3.interpolateRdYlGn); //d3 bietet uns verschiedene Standard-Farbschemata an, siehe hier https://d3js.org/d3-scale-chromatic

  //Hier legen wir fest, wie graphische Elemente auf Basis unserer Daten in unser Fenster eingefügt werden soll.
  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`); //mittig platzieren

  //2 Kreise als Markierungen
  g.append("circle")
    .attr("r", (innerRadius + outerRadius) / 2)
    .attr("fill", "none")
    .attr("stroke", "grey");

  g.append("circle")
    .attr("r", outerRadius)
    .attr("fill", "none")
    .attr("stroke", "grey");

  const newGraph = g
    .selectAll("path") //wir wählen alle "path"-Elemente aus - aktuell gibt es noch keine, aber gleich generieren wir welche...
    .data(data) //das ist unser Datensatz...
    .join("path") //jetzt generieren wir "path"-Elemente für jeden Datenpunkt im eben genannten Datensatz
    .attr("fill", (d) => scaleC(d.value)) //die "Füllung" der Balken soll eine Farbe auf unserer Farbskala sein, abhängig vom Öko-Wert
    .attr("d", (d) =>
      d3.arc()({
        innerRadius: innerRadius, //der innere, "leere" Kreis
        outerRadius: scaleY(d.value), //je größer der Wert, desto höher der Balken
        startAngle: scaleX(d.hour),
        endAngle: scaleX(d.hour) + scaleX.bandwidth(), //startAngle und endAngle legen zusammen fest, wie breit der Balken sein soll: bei welchem Winkel auf dem Kreis soll er beginnen, bei welchem aufhören?
        padAngle: 0.005, //wieviel Platz zwischen den Balken sein soll
      })
    );

  //Beschriftungen

  g.append("text")
    .attr("class", "radial_center_text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "12px")
    // .style("font-weight", "bold")
    .text("Hourly Passengers")
    .append("tspan")
    .attr("x", 0)
    .attr("dy", "1.2em")
    .text("/ 100kg CO2");

  g.selectAll(".hour_label")
    .data(data)
    .join("text")
    .attr("class", "hour-label")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .attr("x", (d) => {
      const angle = scaleX(d.hour) + scaleX.bandwidth();
      return Math.sin(angle) * (outerRadius + 15);
    })
    .attr("y", (d) => {
      const angle = scaleX(d.hour) + scaleX.bandwidth();
      return -Math.cos(angle) * (outerRadius + 15);
    })
    .text((d) => d.hour);

  // tick lines for each hour
  const tickLength = 15;
  g.selectAll(".hour-tick")
    .data(data)
    .join("line")
    .attr("class", "hour-tick")
    .attr("x1", (d) => {
      const angle = scaleX(d.hour) + scaleX.bandwidth();
      return Math.sin(angle) * outerRadius;
    })
    .attr("y1", (d) => {
      const angle = scaleX(d.hour) + scaleX.bandwidth();
      return -Math.cos(angle) * outerRadius;
    })
    .attr("x2", (d) => {
      const angle = scaleX(d.hour) + scaleX.bandwidth();
      return Math.sin(angle) * (outerRadius - tickLength);
    })
    .attr("y2", (d) => {
      const angle = scaleX(d.hour) + scaleX.bandwidth();
      return -Math.cos(angle) * (outerRadius - tickLength);
    })
    .attr("stroke", "#999")
    .attr("opacity", "0.8")
    .attr("stroke-width", 1);
}
