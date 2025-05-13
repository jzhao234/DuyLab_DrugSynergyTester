"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useFile } from "@/app/context/Context";

export default function Bliss() {
  const { Data, fileName } = useFile();
  const svgRef = useRef(null);

  useEffect(() => {
    if (!Data || Data.length < 2) return;

    // Parse data
    const headers = Data[0];
    const rows = Data.slice(1).map((d, i) => {
        const [
            pairIndex,
            drug1,
            drug2,
            conc1,
            conc2,
            response,
            concUnit
        ] = d;

        return {
            PairIndex: pairIndex,
            Drug1: drug1,
            Drug2: drug2,
            Conc1: Number(conc1),
            Conc2: Number(conc2),
            Inhibition: 100 - Number(response), // Calcuate Inhibition From Response
            ConcUnit: concUnit
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

    console.log("uniqueConc1: " + uniqueConc1)
    const uniqueConc2 = [
        ...new Set(
            rows
            .map((row) => row.Conc2)
            .filter((val) => typeof val === "number" && !isNaN(val))
        ),
    ];
    console.log("uniqueConc2: " + uniqueConc2)

    const conc1Arr = [...uniqueConc1];
    conc1Arr.sort((a, b) => a - b);
    console.log("conc1Arr: " + conc1Arr)
    const conc2Arr = [...uniqueConc2];
    conc2Arr.sort((a, b) => a - b);
    console.log("conc2Arr: " + conc2Arr)

    // Initialize 2D array
    const synergy = Array.from({ length: conc1Arr.length }, () =>
    Array(conc2Arr.length).fill(null)
    );

    for (let i = 0; i < conc1Arr.length; i++) {
        for (let j = 0; j < conc2Arr.length; j++) {
            const xVal = conc1Arr[i];
            const yVal = conc2Arr[j];

            const match = rows.find((row) => row.Conc1 === xVal && row.Conc2 === yVal);
            const matchDrugA = rows.find((row) => row.Conc1 === 0 && row.Conc2 === yVal);
            const matchDrugB = rows.find((row) => row.Conc1 === xVal && row.Conc2 === 0);

            if (match && matchDrugA && matchDrugB) {
                    const A = matchDrugA.Inhibition / 100;
                    const B = matchDrugB.Inhibition / 100;
                    synergy[i][j] = match.Inhibition - 100 * (1 - (1 - A) * (1 - B));
            }
        }
    }
    console.log("synergy" + synergy);
    let sum = 0;
    for (let i = 0; i < conc1Arr.length; i++) {
        for (let j = 0; j < conc2Arr.length; j++) {
            sum += synergy[i][j]
        }
    }
    console.log("Synergy Sum: " + sum)
    
    // Flatten synergy array for D3
    const synergyData = [];
    for (let i = 0; i < conc1Arr.length; i++) {
        for (let j = 0; j < conc2Arr.length; j++) {
            if (synergy[i][j] !== null) {
                if (!(isNaN(synergy[i][j])))
                {
                    synergyData.push({
                        Conc1: conc1Arr[i],
                        Conc2: conc2Arr[j],
                        Value: synergy[i][j],
                    });
                }
            
            }
        }
    }
    for (let i = 0; i < conc1Arr.length; i++) {
        for (let j = 0; j < conc2Arr.length; j++) {
            if (isNaN(synergyData[i][j])){
                synergyData[i][j] === 0 
            }
        }
    }
    console.log("synergyData: " + synergyData)

    // Set dimensions
    const width = 500;
    const height = 500;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

    // Scales
    const x = d3
        .scaleBand()
        .domain(conc1Arr)
        .range([margin.left, width - margin.right])
        .padding(0.05);

    const y = d3
        .scaleBand()
        .domain(conc2Arr)
        .range([height - margin.top, margin.bottom])
        .padding(0.05);

    const synergyValues = synergyData.map(d => d.Value);

    // Values > 0
    const positiveMax = d3.max(synergyValues.filter(v => v > 0)) || 0;

    // Values < 0
    const negativeMin = d3.min(synergyValues.filter(v => v < 0)) || 0;

    // Define color scales with dynamic domain
    const colorScaleGreater = d3
    .scaleSequential(d3.interpolateReds)
    .domain([0, positiveMax]);

    const colorScaleLesser = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([0, Math.abs(negativeMin)]); // domain must go low to high


    // Draw heatmap squares
    svg
        .selectAll("rect")
        .data(synergyData)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.Conc1))
        .attr("y", (d) => y(d.Conc2))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", (d) => {
            if (d.Value >= 0) {
                return colorScaleGreater(d.Value);
            } else {
                return colorScaleLesser(d.Value);
            }
        });


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

    // Add axes
    svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom + 20})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("~s")))
        .call(g =>
            g.selectAll("text")
            .attr("class", "fill-black dark:fill-white")
        )
        .call(g =>
            g.selectAll("path,line")
            .attr("class", "stroke-black dark:stroke-white")
        );

    svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format("~s")));

    // Axis labels
    svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height)
        .style("text-anchor", "middle")
        .attr("class", "fill-black dark:fill-white")
        .text(`${drug1Name}`)

    svg
        .append("text")
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
      <h2 className="text-xl font-bold mb-2 text-black dark:text-white"> Drug Synergy </h2>
      <svg ref={svgRef} className="text-black dark:text-white"></svg>
    </div>
  );
}
