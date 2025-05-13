"use client";

import * as XLSX from "xlsx";
import { useFile } from "@/app/context/Context";

export default function UploadFile() {
  const { setData, setFileName } = useFile();

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      // Optionally, handle error state here
    };

    // CSV
    if (file.name.endsWith(".csv")) {
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.trim().split("\n").map((r) => r.split(","));
        setData(rows);
      };
      reader.readAsText(file);
    }

    // XLSX
    else if (file.name.endsWith(".xlsx")) {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        try {
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0]; // Assuming first sheet
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // 2D array
          setData(rows);
        } catch (error) {
          console.error("Error parsing XLSX file:", error);
          // Optionally, handle error state here
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("Invalid file type.");
      // Optionally, handle error state here
    }
  };

  return (
    <div>
      <input
        type="file"
        id="csvInput"
        accept=".csv, .xlsx"
        className="hidden"
        onChange={handleChange}
      />
      <label
        htmlFor="csvInput"
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        Browse Files
      </label>
    </div>
  );
}
