"use client";

import { createContext, useContext, useState } from "react"

const Context = createContext();

export function Provider({children}) {
    const [Data, setData] = useState(null);
    const [fileName, setFileName] = useState("");

    return (
        <Context.Provider value ={{Data, setData, fileName, setFileName}}>
            {children}
        </Context.Provider>
    );
}

export function useFile(){
    return useContext(Context);
}