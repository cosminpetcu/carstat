"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const brands = ["Audi", "BMW", "Ford", "Mercedes-Benz", "Opel", "Peugeot", "Renault", "Skoda", "Volkswagen"];

const modelsByBrand: Record<string, string[]> = {
  Audi: ["A3", "A4", "A6"],
  BMW: ["1 Series", "3 Series", "5 Series"],
  Ford: ["Fiesta", "Focus", "Kuga"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class"],
  Opel: ["Astra", "Corsa", "Insignia"],
  Peugeot: ["208", "308", "3008"],
  Renault: ["Clio", "Megane", "Captur"],
  Skoda: ["Fabia", "Octavia", "Superb"],
  Volkswagen: ["Golf", "Passat", "Tiguan"],
};

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG"];
const maxPrices = [1000, 2000, 5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000];
const maxMileages = [10000, 25000, 50000, 75000, 100000, 150000, 200000];
const yearsFrom = Array.from({ length: 2024 - 1990 + 1 }, (_, i) => 1990 + i);

const SearchBox = () => {
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<"new" | "used">("new");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [maxMileage, setMaxMileage] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value);
    setSelectedModel("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (selectedBrand) params.append("brand", selectedBrand);
    if (selectedModel) params.append("model", selectedModel);
    if (selectedFuel) params.append("fuel_type", selectedFuel);
    if (yearFrom) params.append("year_min", yearFrom);
    if (maxMileage) params.append("mileage_max", maxMileage);
    if (maxPrice) params.append("max_price", maxPrice);
    params.append("is_new", selectedType === "new" ? "true" : "false");

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
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
          type="button"
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

      <select
        value={selectedBrand}
        onChange={handleBrandChange}
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      >
        <option value="">Select brand</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        disabled={!selectedBrand}
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      >
        <option value="">Select model</option>
        {(modelsByBrand[selectedBrand] || []).map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <select
        value={selectedFuel}
        onChange={(e) => setSelectedFuel(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      >
        <option value="">Fuel type</option>
        {fuelTypes.map((fuel) => (
          <option key={fuel} value={fuel}>
            {fuel}
          </option>
        ))}
      </select>

      <select
        value={yearFrom}
        onChange={(e) => setYearFrom(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      >
        <option value="">Year from</option>
        {yearsFrom.map((year) => (
          <option key={year} value={year.toString()}>
            {year}
          </option>
        ))}
      </select>

      <select
        value={maxMileage}
        onChange={(e) => setMaxMileage(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      >
        <option value="">Max mileage</option>
        {maxMileages.map((km) => (
          <option key={km} value={km.toString()}>
            {km.toLocaleString()}
          </option>
        ))}
      </select>

      <select
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2"
      >
        <option value="">Max price</option>
        {maxPrices.map((price) => (
          <option key={price} value={price.toString()}>
            {price.toLocaleString()}
          </option>
        ))}
      </select>

      <div className="flex justify-between">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
          🔍 Show Results
        </button>
        <button type="button" className="text-sm underline text-blue-600">Detailed Search</button>
      </div>
    </form>
  );
};

export default SearchBox;
