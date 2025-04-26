"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG"];
const sellerTypes = ["Private", "Dealer"];

export default function DetailedSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mileageMin, setMileageMin] = useState("");
  const [mileageMax, setMileageMax] = useState("");
  const [enginePowerMin, setEnginePowerMin] = useState("");
  const [enginePowerMax, setEnginePowerMax] = useState("");
  const [engineCapacityMin, setEngineCapacityMin] = useState("");
  const [engineCapacityMax, setEngineCapacityMax] = useState("");
  const [isNew, setIsNew] = useState("any");
  const [sellerType, setSellerType] = useState("");
  const [carsCount, setCarsCount] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();

    if (brand) params.append("brand", brand);
    if (model) params.append("model", model);
    if (fuelType) params.append("fuel_type", fuelType);
    if (yearMin) params.append("year_min", yearMin);
    if (yearMax) params.append("year_max", yearMax);
    if (priceMin) params.append("min_price", priceMin);
    if (priceMax) params.append("max_price", priceMax);
    if (mileageMin) params.append("mileage_min", mileageMin);
    if (mileageMax) params.append("mileage_max", mileageMax);
    if (enginePowerMin) params.append("engine_power_min", enginePowerMin);
    if (enginePowerMax) params.append("engine_power_max", enginePowerMax);
    if (engineCapacityMin) params.append("engine_capacity_min", engineCapacityMin);
    if (engineCapacityMax) params.append("engine_capacity_max", engineCapacityMax);
    if (sellerType) params.append("seller_type", sellerType);
    if (isNew !== "any") params.append("is_new", isNew);

    fetch(`http://localhost:8000/cars/count?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCarsCount(data.total);
      })
      .catch(() => setCarsCount(null));
  }, [brand, model, fuelType, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, enginePowerMin, enginePowerMax, engineCapacityMin, engineCapacityMax, isNew, sellerType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (brand) params.append("brand", brand);
    if (model) params.append("model", model);
    if (fuelType) params.append("fuel_type", fuelType);
    if (yearMin) params.append("year_min", yearMin);
    if (yearMax) params.append("year_max", yearMax);
    if (priceMin) params.append("min_price", priceMin);
    if (priceMax) params.append("max_price", priceMax);
    if (mileageMin) params.append("mileage_min", mileageMin);
    if (mileageMax) params.append("mileage_max", mileageMax);
    if (enginePowerMin) params.append("engine_power_min", enginePowerMin);
    if (enginePowerMax) params.append("engine_power_max", enginePowerMax);
    if (engineCapacityMin) params.append("engine_capacity_min", engineCapacityMin);
    if (engineCapacityMax) params.append("engine_capacity_max", engineCapacityMax);
    if (sellerType) params.append("seller_type", sellerType);
    if (isNew !== "any") params.append("is_new", isNew);

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <section className="py-12 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Detailed Search</h1>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Fuel Type</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
          <select value={isNew} onChange={(e) => setIsNew(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="any">New or Used</option>
            <option value="true">New</option>
            <option value="false">Used</option>
          </select>
          <input type="number" placeholder="Year from" value={yearMin} onChange={(e) => setYearMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Year to" value={yearMax} onChange={(e) => setYearMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Price Min (€)" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Price Max (€)" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Mileage Min (km)" value={mileageMin} onChange={(e) => setMileageMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Mileage Max (km)" value={mileageMax} onChange={(e) => setMileageMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Engine Power Min (hp)" value={enginePowerMin} onChange={(e) => setEnginePowerMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Engine Power Max (hp)" value={enginePowerMax} onChange={(e) => setEnginePowerMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Engine Capacity Min (cc)" value={engineCapacityMin} onChange={(e) => setEngineCapacityMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <input type="number" placeholder="Engine Capacity Max (cc)" value={engineCapacityMax} onChange={(e) => setEngineCapacityMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm" />
          <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Seller Type</option>
            {sellerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </form>

        <div className="mt-6 flex flex-col items-center">
          <button type="submit" onClick={handleSearch} className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold">
            {carsCount !== null ? `${carsCount} Cars` : "Show Cars"}
          </button>
        </div>
      </section>
      <Footer />
    </main>
  );
}
