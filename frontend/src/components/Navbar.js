"use client";

import Image from "next/image";
import DarkModeToggle from "./DarkModeToggle";
import TempleLogo from "./TempleLogo";

export default function Navbar() {
    return (
        <nav className="flex flex-col pb-2 border-b-1 bg-white dark:bg-[#151516] text-black dark:text-white">
            
            <div className="flex">
                {/*<TempleLogo/>*/}
                <div className="flex flex-col">
                    <p> Duy Lab </p>
                    <p> Drug Synergies </p>
                </div>
                <DarkModeToggle/>
            </div>
            {/* Navigation Links */}
            <div> 

            </div>
        </nav>
    )
}