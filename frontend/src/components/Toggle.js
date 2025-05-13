"use client";

export default function Toggle () {
    return (
        <label className="toggle-switch bg-gray-100 cursor-pointer relative w-12 h-6 rounded-full inline-block">
            <input type="checkbox" className="sr-only peer" />
            <span className="slider w-6 h-6 bg-green-300 absolute rounded-full transition-all duration-500 peer-checked:bg-green-600 peer-checked:left-7"></span>
        </label>
    );
}
