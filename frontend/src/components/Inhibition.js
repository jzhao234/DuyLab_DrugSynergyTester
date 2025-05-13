"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useFile } from "@/app/context/Context";

export default function Inhibition() {
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

    const inhibitionData = [];

    for (let i = 0; i < conc1Arr.length; i++) {
        for (let j = 0; j < conc2Arr.length; j++) {
            const xVal = conc1Arr[i];
            const yVal = conc2Arr[j];

            const match = rows.find((row) => row.Conc1 === xVal && row.Conc2 === yVal);
            
            if (match && !isNaN(match.Inhibition)) {
                inhibitionData.push({
                    Conc1: xVal,
                    Conc2: yVal,
                    Value: match.Inhibition,
                });
            }
        }
    }


    const width = 500;
    const height = 500;
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };

    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

    //Scales

    //X-Scale
    const x = d3
        .scaleBand()
        .domain(conc1Arr)
        .range([margin.left, width - margin.right])
        .padding(0.05);

    //Y-Scale
    const y = d3
        .scaleBand()
        .domain(conc2Arr)
        .range([height-margin.top, margin.bottom])
        .padding(0.05);
    
    const color = d3
        .scaleSequential(d3.interpolateReds)
        .domain(d3.extent(inhibitionData, (d) => d.Value));

    // Draw graph

    svg
        .selectAll("rect")
        .data(inhibitionData)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.Conc1))
        .attr("y", (d) => y(d.Conc2))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", (d) => color(d.Value));

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
        .call(d3.axisLeft(y).tickFormat(d3.format("~s")))
        .call(g =>
            g.selectAll("text")
            .attr("class", "fill-black dark:fill-white")
        )
        .call(g =>
            g.selectAll("path,line")
            .attr("class", "stroke-black dark:stroke-white")
        );

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
        .text(`${drug2Name}`)

  }, [Data]);

  if (!Data) return <p className="text-black dark:text-white">No File Information Uploaded</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2 text-black dark:text-white"> Drug Inhibition </h2>
      <svg ref={svgRef}></svg>
    </div>
  );
}
