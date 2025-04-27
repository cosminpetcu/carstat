"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import brandsModels from "@/app/data/brands_models";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG"];
const sellerTypes = ["Private", "Dealer"];
const isNewOptions = [
  { label: "Any", value: "any" },
  { label: "New", value: "true" },
  { label: "Used", value: "false" }
];
const priceOptions = ["1000", "2000", "3000", "4000", "5000", "6000", "7000", "8000", "9000", "10000", "12500", "15000", "17500", "20000", "25000", "30000", "40000", "50000", "60000", "70000", "80000", "90000", "100000"];
const yearOptions = Array.from({ length: 2024 - 1990 + 1 }, (_, i) => 1990 + i);
const mileageOptions = ["0", "10000", "50000", "100000", "150000", "200000", "300000"];
const powerOptions = ["50", "100", "150", "200", "250", "300", "400", "500", "750", "1000"];
const capacityOptions = ["1000", "1500", "2000", "2500", "3000", "4000"];

export default function SidebarFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    fuel_type: "",
    seller_type: "",
    is_new: "any",
    min_price: "",
    max_price: "",
    year_min: "",
    year_max: "",
    mileage_min: "",
    mileage_max: "",
    engine_power_min: "",
    engine_power_max: "",
    engine_capacity_min: "",
    engine_capacity_max: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = { ...filters };
    (Object.keys(newFilters) as (keyof typeof newFilters)[]).forEach((key) => {
      newFilters[key] = params.get(key) || "";
    });
    setFilters(newFilters);
  }, [searchParams]);
  
  

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "any") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <aside className="bg-gray-900 text-white p-4 rounded-xl space-y-4 w-full max-w-[300px]">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>

      <div className="space-y-2">
        {/* Brand */}
        <select value={filters.brand} onChange={(e) => updateFilter("brand", e.target.value)} className="w-full rounded-md p-2 text-black">
          <option value="">All Brands</option>
          {Object.keys(brandsModels).map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>

        {/* Model */}
        <select value={filters.model} onChange={(e) => updateFilter("model", e.target.value)} className="w-full rounded-md p-2 text-black">
          <option value="">All Models</option>
          {(brandsModels[filters.brand] || []).map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        {/* Fuel Type */}
        <select value={filters.fuel_type} onChange={(e) => updateFilter("fuel_type", e.target.value)} className="w-full rounded-md p-2 text-black">
          <option value="">All Fuel Types</option>
          {fuelTypes.map((fuel) => (
            <option key={fuel} value={fuel}>{fuel}</option>
          ))}
        </select>

        {/* Seller Type */}
        <select value={filters.seller_type} onChange={(e) => updateFilter("seller_type", e.target.value)} className="w-full rounded-md p-2 text-black">
          <option value="">All Seller Types</option>
          {sellerTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Is New */}
        <select value={filters.is_new} onChange={(e) => updateFilter("is_new", e.target.value)} className="w-full rounded-md p-2 text-black">
          {isNewOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Min / Max dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <select value={filters.min_price} onChange={(e) => updateFilter("min_price", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Min Price</option>
            {priceOptions.map((val) => (
              <option key={val} value={val}>{val} €</option>
            ))}
          </select>

          <select value={filters.max_price} onChange={(e) => updateFilter("max_price", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Max Price</option>
            {priceOptions.map((val) => (
              <option key={val} value={val}>{val} €</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select value={filters.year_min} onChange={(e) => updateFilter("year_min", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Min Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select value={filters.year_max} onChange={(e) => updateFilter("year_max", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Max Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select value={filters.mileage_min} onChange={(e) => updateFilter("mileage_min", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Min Mileage</option>
            {mileageOptions.map((val) => (
              <option key={val} value={val}>{val} km</option>
            ))}
          </select>

          <select value={filters.mileage_max} onChange={(e) => updateFilter("mileage_max", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Max Mileage</option>
            {mileageOptions.map((val) => (
              <option key={val} value={val}>{val} km</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select value={filters.engine_power_min} onChange={(e) => updateFilter("engine_power_min", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Min Power</option>
            {powerOptions.map((val) => (
              <option key={val} value={val}>{val} hp</option>
            ))}
          </select>

          <select value={filters.engine_power_max} onChange={(e) => updateFilter("engine_power_max", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Max Power</option>
            {powerOptions.map((val) => (
              <option key={val} value={val}>{val} hp</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select value={filters.engine_capacity_min} onChange={(e) => updateFilter("engine_capacity_min", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Min Capacity</option>
            {capacityOptions.map((val) => (
              <option key={val} value={val}>{val} cm3</option>
            ))}
          </select>

          <select value={filters.engine_capacity_max} onChange={(e) => updateFilter("engine_capacity_max", e.target.value)} className="rounded-md p-2 text-black">
            <option value="">Max Capacity</option>
            {capacityOptions.map((val) => (
              <option key={val} value={val}>{val} cm3</option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}
