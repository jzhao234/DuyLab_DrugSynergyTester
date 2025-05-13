"use client";

import { Updock } from "next/font/google";
import Toggle from "./Toggle";
import UploadFile from "./UploadFile";

export default function Sidebar(){
    return(
        <div className="flex flex-col border-1">
            <div>
                <p> Annotation File </p>
                <UploadFile/>
            </div>
            <div>
                <p> Choose Readout: </p>
            </div>
            <div> 
                <p> Detect Outliers: </p>
            </div>
            <div> 
                <p> Curve Fitting </p>
            </div>
            <div>
                <p> Visualize Dose-Response Data </p>
                <Toggle/>
            </div>
            <div> 
                <p> Calculate Synergy </p>
                <Toggle/>
            </div>
        </div>
    );
}