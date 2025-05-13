"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useFile } from "@/app/context/Context";

export default function BlissContour() {
  const { Data } = useFile();
  const svgRef = useRef(null);

  useEffect(() => {
    if (!Data || Data.length < 2) return;

    const rows = Data.slice(1).map((d) => {
      const [_, drug1, drug2, conc1, conc2, response, concUnit] = d;
      return {
        Drug1: drug1,
        Drug2: drug2,
        Conc1: Number(conc1),
        Conc2: Number(conc2),
        Inhibition: 100 - Number(response),
        ConcUnit: concUnit,
      };
    });

    const drug1Name = rows[0]?.Drug1 || "Drug 1";
    const drug2Name = rows[0]?.Drug2 || "Drug 2";

    const uniqueConc1 = [
      ...new Set(
        rows
          .map((row) => row.Conc1)
          .filter((val) => typeof val === "number" && !isNaN(val))
      ),
    ];

    const uniqueConc2 = [
      ...new Set(
        rows
          .map((row) => row.Conc2)
          .filter((val) => typeof val === "number" && !isNaN(val))
      ),
    ];

    const conc1Arr = [...uniqueConc1].sort((a, b) => a - b);
    const conc2Arr = [...uniqueConc2].sort((a, b) => a - b);

    const synergyGrid = Array.from({ length: conc2Arr.length }, () =>
      Array(conc1Arr.length).fill(0)
    );

    for (let i = 0; i < conc1Arr.length; i++) {
      for (let j = 0; j < conc2Arr.length; j++) {
        const xVal = conc1Arr[i];
        const yVal = conc2Arr[j];

        const match = rows.find(row => row.Conc1 === xVal && row.Conc2 === yVal);
        const matchDrugA = rows.find(row => row.Conc1 === 0 && row.Conc2 === yVal);
        const matchDrugB = rows.find(row => row.Conc1 === xVal && row.Conc2 === 0);

        if (match && matchDrugA && matchDrugB) {
          const A = matchDrugA.Inhibition / 100;
          const B = matchDrugB.Inhibition / 100;
          synergyGrid[j][i] = match.Inhibition - 100 * (1 - (1 - A) * (1 - B));
        }
      }
    }

    const flatSynergy = synergyGrid.flat();

    const width = 500;
    const height = 500;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const x = d3.scaleBand()
      .domain(conc1Arr)
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleBand()
      .domain(conc2Arr)
      .range([height - margin.bottom, margin.top])
      .padding(0.1);

    const positiveMax = d3.max(flatSynergy.filter(v => v > 0)) || 0;
    const negativeMin = d3.min(flatSynergy.filter(v => v < 0)) || 0;

    const colorScaleGreater = d3.scaleSequential(d3.interpolateReds)
      .domain([0, positiveMax]);

    const colorScaleLesser = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, Math.abs(negativeMin)]);

    const gridSizeX = conc1Arr.length;
    const gridSizeY = conc2Arr.length;

    const contours = d3.contours()
      .size([gridSizeX, gridSizeY])
      .thresholds(d3.range(-50, 55, 5))
      (flatSynergy);

    const xScaleRatio = (width - margin.left - margin.right) / (gridSizeX - 1);
    const yScaleRatio = (height - margin.top - margin.bottom) / (gridSizeY - 1);

    const path = d3.geoPath(d3.geoIdentity()
      .scale(1)
      .translate([margin.left, margin.top])
      .scale(Math.min(xScaleRatio, yScaleRatio)));

    svg.selectAll("path")
      .data(contours)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", (d) => {
        return d.value >= 0 ? colorScaleGreater(d.value) : colorScaleLesser(d.value);
      })
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.85);

    // Create a diverging color scale for the legend
    const min = negativeMin;
    const max = positiveMax;
    const mid = 0;

    const divergingColor = d3.scaleDiverging()
      .domain([min, mid, max])
      .interpolator(d3.interpolateRdBu)  // Red for positive, blue for negative
      .clamp(true);

    // Dual Color Legends
    const legendHeight = 10;
    const legendBarWidth = 140;
    const legendSpacing = 20;

    const legendGroup = svg.append("g")
        .attr("transform", `translate(${(width - (legendBarWidth * 2 + legendSpacing)) / 2}, ${margin.top - 30})`);

    // Define gradients
    const defs = svg.append("defs");

    // Red Gradient (Positive Values)
    const redGradientId = "legend-gradient-red";
    const redGradient = defs.append("linearGradient")
        .attr("id", redGradientId)
        .attr("x1", "0%")
        .attr("x2", "100%");

    redGradient.selectAll("stop")
        .data(d3.ticks(0, positiveMax, 10))
        .enter()
        .append("stop")
        .attr("offset", (d, i, n) => `${(100 * i) / (n.length - 1)}%`)
        .attr("stop-color", d => colorScaleGreater(d));

    // Blue Gradient (Negative Values)
    const blueGradientId = "legend-gradient-blue";
    const blueGradient = defs.append("linearGradient")
        .attr("id", blueGradientId)
        .attr("x1", "0%")
        .attr("x2", "100%");

    blueGradient.selectAll("stop")
        .data(d3.ticks(negativeMin, 0, 10))
        .enter()
        .append("stop")
        .attr("offset", (d, i, n) => `${(100 * i) / (n.length - 1)}%`)
        .attr("stop-color", d => colorScaleLesser(Math.abs(d)));

    // Append red legend
    legendGroup.append("rect")
        .attr("x", legendBarWidth + legendSpacing)
        .attr("width", legendBarWidth)
        .attr("height", legendHeight)
        .style("fill", `url(#${redGradientId})`);

    // Append blue legend
    legendGroup.append("rect")
        .attr("width", legendBarWidth)
        .attr("height", legendHeight)
        .style("fill", `url(#${blueGradientId})`);

    // Scales for legends
    const blueLegendScale = d3.scaleLinear()
        .domain([negativeMin, 0])
        .range([0, legendBarWidth]);

    const redLegendScale = d3.scaleLinear()
        .domain([0, positiveMax])
        .range([0, legendBarWidth]);

    // Axes for legends
    legendGroup.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(blueLegendScale).ticks(5).tickFormat(d3.format("~s")))
        .call(g => g.selectAll("text").attr("class", "fill-black dark:fill-white"))
        .call(g => g.selectAll("path,line").attr("class", "stroke-black dark:stroke-white"));

    legendGroup.append("g")
        .attr("transform", `translate(${legendBarWidth + legendSpacing}, ${legendHeight})`)
        .call(d3.axisBottom(redLegendScale).ticks(5).tickFormat(d3.format("~s")))
        .call(g => g.selectAll("text").attr("class", "fill-black dark:fill-white"))
        .call(g => g.selectAll("path,line").attr("class", "stroke-black dark:stroke-white"));

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call(g => g.selectAll("text").attr("class", "fill-black dark:fill-white"))
      .call(g => g.selectAll("path,line").attr("class", "stroke-black dark:stroke-white"));

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.selectAll("text").attr("class", "fill-black dark:fill-white"))
      .call(g => g.selectAll("path,line").attr("class", "stroke-black dark:stroke-white"));

    // Axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .attr("class", "fill-black dark:fill-white")
      .text(`${drug1Name}`);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .style("text-anchor", "middle")
      .attr("class", "fill-black dark:fill-white")
      .text(`${drug2Name}`);
  }, [Data]);

  if (!Data) return <p className="text-black dark:text-white">No File Information Uploaded</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2 text-black dark:text-white">Drug Synergy (Contour Style)</h2>
      <svg ref={svgRef} className="text-black dark:text-white"></svg>
    </div>
  );
}
