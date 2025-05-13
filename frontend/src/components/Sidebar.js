"use client";

import { Updock } from "next/font/google";
import Toggle from "./Toggle";
import UploadFile from "./UploadFile";

export default function Sidebar(){
    return(
        <div className="h-screen">
            <div className="flex flex-col justify-between h-full border-0 border-l pl-2 pt-2 ml-1 text-black dark:text-white">
                <div>
                    <p className="pb-5"> Annotation File </p>
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
        </div>
    );
}