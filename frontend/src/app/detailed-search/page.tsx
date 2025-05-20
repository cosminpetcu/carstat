"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG"];
const sellerTypes = ["Private", "Dealer"];
const isNewOptions = [
  { label: "Any", value: "any" },
  { label: "New", value: "true" },
  { label: "Used", value: "false" },
];
const priceOptions = ["1000", "2000", "3000", "4000", "5000", "6000", "7000", "8000", "9000", "10000", "12500", "15000", "17500", "20000", "25000", "30000", "40000", "50000", "60000", "70000", "80000", "90000", "100000"];
const yearOptions = Array.from({ length: 2024 - 1990 + 1 }, (_, i) => (1990 + i).toString());
const mileageOptions = ["0", "10000", "50000", "100000", "150000", "200000", "300000"];
const powerOptions = ["50", "100", "150", "200", "250", "300", "400", "500", "750", "1000"];
const capacityOptions = ["1000", "1500", "2000", "2500", "3000", "4000"];

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
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

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

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        const response = await fetch('http://localhost:8000/analytics/available-brands');
        if (response.ok) {
          const brands = await response.json();
          setAvailableBrands(brands);
        } else {
          console.error('Failed to fetch brands');
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    if (!brand) {
      setAvailableModels([]);
      return;
    }

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch(`http://localhost:8000/analytics/available-models/${brand}`);
        if (response.ok) {
          const models = await response.json();
          setAvailableModels(models);
        } else {
          console.error('Failed to fetch models');
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [brand]);

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <section className="py-12 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Detailed Search</h1>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand */}
          <div className="relative w-full">
            <select 
              value={brand} 
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
              }} 
              className={`border px-4 py-2 rounded-md text-sm w-full ${isLoadingBrands ? 'opacity-50' : ''}`}
              disabled={isLoadingBrands}
            >
              <option value="">All Brands</option>
              {isLoadingBrands ? (
                <option value="" disabled>Loading brands...</option>
              ) : (
                availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))
              )}
            </select>
            {isLoadingBrands && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Model */}
          <div className="relative w-full">
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              className={`border px-4 py-2 rounded-md text-sm w-full ${isLoadingModels || !brand ? 'opacity-50' : ''}`}
              disabled={isLoadingModels || !brand}
            >
              <option value="">All Models</option>
              {isLoadingModels ? (
                <option value="" disabled>Loading models...</option>
              ) : (
                availableModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))
              )}
            </select>
            {isLoadingModels && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Fuel Type */}
          <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Fuel Type</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </select>

          {/* Is New */}
          <select value={isNew} onChange={(e) => setIsNew(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            {isNewOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Year Min / Max */}
          <select value={yearMin} onChange={(e) => setYearMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Year from</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select value={yearMax} onChange={(e) => setYearMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Year to</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Price Min / Max */}
          <select value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Price Min (€)</option>
            {priceOptions.map((price) => (
              <option key={price} value={price}>{price} €</option>
            ))}
          </select>
          <select value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Price Max (€)</option>
            {priceOptions.map((price) => (
              <option key={price} value={price}>{price} €</option>
            ))}
          </select>

          {/* Mileage Min / Max */}
          <select value={mileageMin} onChange={(e) => setMileageMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Mileage Min (km)</option>
            {mileageOptions.map((km) => (
              <option key={km} value={km}>{km} km</option>
            ))}
          </select>
          <select value={mileageMax} onChange={(e) => setMileageMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Mileage Max (km)</option>
            {mileageOptions.map((km) => (
              <option key={km} value={km}>{km} km</option>
            ))}
          </select>

          {/* Engine Power Min / Max */}
          <select value={enginePowerMin} onChange={(e) => setEnginePowerMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Power Min (hp)</option>
            {powerOptions.map((p) => (
              <option key={p} value={p}>{p} hp</option>
            ))}
          </select>
          <select value={enginePowerMax} onChange={(e) => setEnginePowerMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Power Max (hp)</option>
            {powerOptions.map((p) => (
              <option key={p} value={p}>{p} hp</option>
            ))}
          </select>

          {/* Engine Capacity Min / Max */}
          <select value={engineCapacityMin} onChange={(e) => setEngineCapacityMin(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Engine Capacity Min (cm3)</option>
            {capacityOptions.map((c) => (
              <option key={c} value={c}>{c} cm3</option>
            ))}
          </select>
          <select value={engineCapacityMax} onChange={(e) => setEngineCapacityMax(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Engine Capacity Max (cm3)</option>
            {capacityOptions.map((c) => (
              <option key={c} value={c}>{c} cm3</option>
            ))}
          </select>

          {/* Seller Type */}
          <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} className="border px-4 py-2 rounded-md text-sm">
            <option value="">Seller Type</option>
            {sellerTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
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
