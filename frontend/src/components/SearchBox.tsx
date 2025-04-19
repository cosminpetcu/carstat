"use client";

import React, { useState } from "react";

const SearchBox = () => {
  const [selectedType, setSelectedType] = useState<"new" | "used">("new");

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedType("new")}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            selectedType === "new"
              ? "bg-black text-white"
              : "bg-white text-black border-gray-300"
          }`}
        >
          New
        </button>
        <button
          onClick={() => setSelectedType("used")}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            selectedType === "used"
              ? "bg-black text-white"
              : "bg-white text-black border-gray-300"
          }`}
        >
          Used
        </button>
      </div>

      <select className="w-full border border-gray-300 rounded-md px-4 py-2">
        <option>Audi</option>
        <option>BMW</option>
        <option>Ford</option>
      </select>
      <select className="w-full border border-gray-300 rounded-md px-4 py-2">
        <option>GLC</option>
        <option>A6</option>
        <option>Altis</option>
      </select>
      <input
        type="number"
        placeholder="Registrație din anul..."
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      />
      <input
        type="number"
        placeholder="Kilometraj maxim"
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      />
      <input
        type="number"
        placeholder="Preț maxim"
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      />
      <select className="w-full border border-gray-300 rounded-md px-4 py-2">
        <option>Diesel</option>
        <option>Petrol</option>
        <option>Electric</option>
      </select>

      <div className="flex justify-between">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
          🔍 210 Offers
        </button>
        <button className="text-sm underline text-blue-600">Detailed Search</button>
      </div>
    </div>
  );
};

export default SearchBox;