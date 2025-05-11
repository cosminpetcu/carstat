"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import brandsModels from "@/app/data/brands_models";
import { 
  CarIcon, 
  FuelIcon, 
  CalendarIcon, 
  GaugeIcon,
  TransmissionIcon,
  EngineIcon, 
  TireIcon, 
  BatteryIcon, 
  SpeedometerIcon,
  ParkingIcon,
  GPSIcon
} from "@/components/Icons";

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

export default function SidebarFilters({ setToastMessage, setToastType }: { setToastMessage: (msg: string) => void, setToastType: (type: "success" | "error" | "") => void }) {
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

  const [isCollapsed, setIsCollapsed] = useState({
    basic: false,
    prices: true,
    year: true,
    engine: true,
    advanced: true
  });

  const toggleSection = (section: keyof typeof isCollapsed) => {
    setIsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = { ...filters };
    (Object.keys(newFilters) as (keyof typeof newFilters)[]).forEach((key) => {
      newFilters[key] = params.get(key) || "";
    });
    setFilters(newFilters);
  }, [searchParams]);

  const handleSaveSearch = async () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
  
    if (!token || !userRaw) {
      router.push("/login");
      return;
    }
  
    let user;
    try {
      user = JSON.parse(userRaw);
      if (!user.id) throw new Error("Invalid user object");
    } catch (err) {
      console.error("User object invalid:", err);
      router.push("/login");
      return;
    }
  
    const query = searchParams.toString();
  
    try {
      const response = await fetch("http://localhost:8000/saved-searches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          query: query,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save search");
      }
      setToastMessage("Search saved successfully!");
      setToastType("success");
    } catch (error) {
      console.error("Error saving search:", error);
      setToastMessage("Failed to save search.");
      setToastType("error");
    }
  };

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

  const clearAllFilters = () => {
    router.push('/listings');
  };

  return (
    <aside className="bg-gradient-to-b from-gray-900 to-gray-800 text-white p-5 rounded-xl w-full max-w-[320px] shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <GPSIcon className="w-6 h-6 mr-2" />
          Filters
        </h2>
        <button 
          onClick={clearAllFilters}
          className="text-xs text-gray-400 hover:text-white underline"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Filters Section */}
        <div className="border-b border-gray-700 pb-4">
          <button 
            className="flex justify-between items-center w-full text-left mb-3 font-semibold text-lg"
            onClick={() => toggleSection('basic')}
          >
            <span className="flex items-center">
              <CarIcon className="w-5 h-5 mr-2" />
              Car Details
            </span>
            <span>{isCollapsed.basic ? '▼' : '▲'}</span>
          </button>
          
          {!isCollapsed.basic && (
            <div className="space-y-3 pl-2">
              {/* Brand */}
              <div className="relative">
                <select 
                  value={filters.brand} 
                  onChange={(e) => updateFilter("brand", e.target.value)} 
                  className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  <option value="">All Brands</option>
                  {Object.keys(brandsModels).map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CarIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Model */}
              <div className="relative">
                <select 
                  value={filters.model} 
                  onChange={(e) => updateFilter("model", e.target.value)} 
                  className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  disabled={!filters.brand}
                >
                  <option value="">All Models</option>
                  {(brandsModels[filters.brand] || []).map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <ParkingIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Fuel Type */}
              <div className="relative">
                <select 
                  value={filters.fuel_type} 
                  onChange={(e) => updateFilter("fuel_type", e.target.value)} 
                  className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  <option value="">All Fuel Types</option>
                  {fuelTypes.map((fuel) => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FuelIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Seller Type */}
              <div className="relative">
                <select 
                  value={filters.seller_type} 
                  onChange={(e) => updateFilter("seller_type", e.target.value)} 
                  className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  <option value="">All Seller Types</option>
                  {sellerTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <BatteryIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Is New */}
              <div className="relative">
                <select 
                  value={filters.is_new} 
                  onChange={(e) => updateFilter("is_new", e.target.value)} 
                  className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  {isNewOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SpeedometerIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="border-b border-gray-700 pb-4">
          <button 
            className="flex justify-between items-center w-full text-left mb-3 font-semibold text-lg"
            onClick={() => toggleSection('prices')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Price Range
            </span>
            <span>{isCollapsed.prices ? '▼' : '▲'}</span>
          </button>
          
          {!isCollapsed.prices && (
            <div className="grid grid-cols-2 gap-3 pl-2">
              <div className="relative">
                <select 
                  value={filters.min_price} 
                  onChange={(e) => updateFilter("min_price", e.target.value)} 
                  className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  <option value="">Min €</option>
                  {priceOptions.map((val) => (
                    <option key={val} value={val}>{val} €</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select 
                  value={filters.max_price} 
                  onChange={(e) => updateFilter("max_price", e.target.value)} 
                  className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                >
                  <option value="">Max €</option>
                  {priceOptions.map((val) => (
                    <option key={val} value={val}>{val} €</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Year Section */}
        <div className="border-b border-gray-700 pb-4">
          <button 
            className="flex justify-between items-center w-full text-left mb-3 font-semibold text-lg"
            onClick={() => toggleSection('year')}
          >
            <span className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Year & Mileage
            </span>
            <span>{isCollapsed.year ? '▼' : '▲'}</span>
          </button>
          
          {!isCollapsed.year && (
            <div className="space-y-3 pl-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select 
                    value={filters.year_min} 
                    onChange={(e) => updateFilter("year_min", e.target.value)} 
                    className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">From</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select 
                    value={filters.year_max} 
                    onChange={(e) => updateFilter("year_max", e.target.value)} 
                    className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">To</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="text-sm text-gray-400 mb-1 block">Mileage (km)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select 
                      value={filters.mileage_min} 
                      onChange={(e) => updateFilter("mileage_min", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                    >
                      <option value="">From</option>
                      {mileageOptions.map((val) => (
                        <option key={val} value={val}>{Number(val).toLocaleString()} km</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <select 
                      value={filters.mileage_max} 
                      onChange={(e) => updateFilter("mileage_max", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                    >
                      <option value="">To</option>
                      {mileageOptions.map((val) => (
                        <option key={val} value={val}>{Number(val).toLocaleString()} km</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Engine Section */}
        <div className="border-b border-gray-700 pb-4">
          <button 
            className="flex justify-between items-center w-full text-left mb-3 font-semibold text-lg"
            onClick={() => toggleSection('engine')}
          >
            <span className="flex items-center">
              <EngineIcon className="w-5 h-5 mr-2" />
              Engine Specs
            </span>
            <span>{isCollapsed.engine ? '▼' : '▲'}</span>
          </button>
          
          {!isCollapsed.engine && (
            <div className="space-y-3 pl-2">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Engine Power (hp)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select 
                      value={filters.engine_power_min} 
                      onChange={(e) => updateFilter("engine_power_min", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                    >
                      <option value="">Min hp</option>
                      {powerOptions.map((val) => (
                        <option key={val} value={val}>{val} hp</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <select 
                      value={filters.engine_power_max} 
                      onChange={(e) => updateFilter("engine_power_max", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                    >
                      <option value="">Max hp</option>
                      {powerOptions.map((val) => (
                        <option key={val} value={val}>{val} hp</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Engine Capacity (cm³)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select 
                      value={filters.engine_capacity_min} 
                      onChange={(e) => updateFilter("engine_capacity_min", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                    >
                      <option value="">Min cc</option>
                      {capacityOptions.map((val) => (
                        <option key={val} value={val}>{val} cm³</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <select 
                      value={filters.engine_capacity_max} 
                      onChange={(e) => updateFilter("engine_capacity_max", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                    >
                      <option value="">Max cc</option>
                      {capacityOptions.map((val) => (
                        <option key={val} value={val}>{val} cm³</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleSaveSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save This Search
          </button>
        </div>
      </div>
    </aside>
  );
}