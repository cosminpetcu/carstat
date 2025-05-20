"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "CNG", "Plug-in Hybrid"];
const sellerTypes = ["Private", "Dealer"];
const driveTypes = ["Sedan", "Hatchback", "SUV", "Wagon", "Coupe", "Convertible", "MPV", "Pickup"];
const transmissionTypes = ["Automatic", "Manual"];
const colors = ["Black", "White", "Grey", "Silver", "Blue", "Red", "Green", "Brown", "Beige", "Yellow/Gold", "Orange", "Other"];
const emissionStandards = ["Euro 1", "Euro 2", "Euro 3", "Euro 4", "Euro 5", "Euro 6", "Non-euro"];
const booleanOptions = [
  { label: "Any", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];
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
const doorOptions = ["2", "3", "4", "5"];
const scoreOptions = ["20", "40", "60", "80"];
const originCountries = ["Germany", "Romania", "Italy", "France", "Spain", "Japan", "UK", "USA", "South Korea", "Sweden"];

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
  const [driveType, setDriveType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [color, setColor] = useState("");
  const [doors, setDoors] = useState("");
  const [emissionStandard, setEmissionStandard] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [rightHandDrive, setRightHandDrive] = useState("");
  const [damaged, setDamaged] = useState("");
  const [firstOwner, setFirstOwner] = useState("");
  const [noAccident, setNoAccident] = useState("");
  const [serviceBook, setServiceBook] = useState("");
  const [registered, setRegistered] = useState("");
  const [qualityScoreMin, setQualityScoreMin] = useState("");
  const [qualityScoreMax, setQualityScoreMax] = useState("");
  const [dealRating, setDealRating] = useState("");
  const [carsCount, setCarsCount] = useState<number | null>(null);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced" | "condition">("basic");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  useEffect(() => {
    setIsLoadingCount(true);
    
    const debounceTimer = setTimeout(() => {
      const params = buildSearchParams();
      
      fetch(`http://localhost:8000/cars/count?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setCarsCount(data.total);
          setIsLoadingCount(false);
        })
        .catch(() => {
          setCarsCount(null);
          setIsLoadingCount(false);
        });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    brand, model, fuelType, yearMin, yearMax, priceMin, priceMax, mileageMin, mileageMax, 
    enginePowerMin, enginePowerMax, engineCapacityMin, engineCapacityMax, isNew, sellerType,
    driveType, transmission, color, doors, emissionStandard, originCountry, rightHandDrive,
    damaged, firstOwner, noAccident, serviceBook, registered, qualityScoreMin, qualityScoreMax,
    dealRating
  ]);

  const buildSearchParams = () => {
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
    if (driveType) params.append("drive_type", driveType);
    if (transmission) params.append("transmission", transmission);
    if (color) params.append("color", color);
    if (doors) params.append("doors", doors);
    if (emissionStandard) params.append("emission_standard", emissionStandard);
    if (originCountry) params.append("origin_country", originCountry);
    if (rightHandDrive) params.append("right_hand_drive", rightHandDrive);
    if (damaged) params.append("damaged", damaged);
    if (firstOwner) params.append("first_owner", firstOwner);
    if (noAccident) params.append("no_accident", noAccident);
    if (serviceBook) params.append("service_book", serviceBook);
    if (registered) params.append("registered", registered);
    if (qualityScoreMin) params.append("quality_score_min", qualityScoreMin);
    if (qualityScoreMax) params.append("quality_score_max", qualityScoreMax);
    if (dealRating) params.append("deal_rating", dealRating);
    
    return params;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = buildSearchParams();
    router.push(`/listings?${params.toString()}`);
  };

  const saveSearch = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const params = buildSearchParams().toString();

      if (!user.id) {
        alert("User information not found. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:8000/saved-searches/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          query: params
        })
      });

      if (response.ok) {
        setIsSaveDialogOpen(false);
        setSearchName("");
        alert("Search criteria saved successfully!");
      } else {
        alert("Failed to save search criteria.");
      }
    } catch (error) {
      console.error("Error saving search:", error);
      alert("An error occurred while saving your search.");
    }
  };

  const clearFilters = () => {

    setBrand("");
    setModel("");
    setFuelType("");
    setYearMin("");
    setYearMax("");
    setPriceMin("");
    setPriceMax("");
    setMileageMin("");
    setMileageMax("");
    setEnginePowerMin("");
    setEnginePowerMax("");
    setEngineCapacityMin("");
    setEngineCapacityMax("");
    setIsNew("any");
    setSellerType("");
    setDriveType("");
    setTransmission("");
    setColor("");
    setDoors("");
    setEmissionStandard("");
    setOriginCountry("");
    setRightHandDrive("");
    setDamaged("");
    setFirstOwner("");
    setNoAccident("");
    setServiceBook("");
    setRegistered("");
    setQualityScoreMin("");
    setQualityScoreMax("");
    setDealRating("");
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
    <main className="min-h-screen flex flex-col bg-gray-50 text-black">
      <Navbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Search</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fine-tune your car search with our comprehensive filter options. Find exactly what you're looking for.
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="flex justify-center mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab("basic")} 
            className={`px-4 py-2 text-sm font-medium ${activeTab === "basic" ? 
              "text-blue-600 border-b-2 border-blue-600" : 
              "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Basic Filters
          </button>
          <button 
            onClick={() => setActiveTab("advanced")} 
            className={`px-4 py-2 text-sm font-medium ${activeTab === "advanced" ? 
              "text-blue-600 border-b-2 border-blue-600" : 
              "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Advanced Filters
          </button>
          <button 
            onClick={() => setActiveTab("condition")} 
            className={`px-4 py-2 text-sm font-medium ${activeTab === "condition" ? 
              "text-blue-600 border-b-2 border-blue-600" : 
              "text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Vehicle Condition
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Brand */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <div className="relative">
                    <select 
                      value={brand} 
                      onChange={(e) => {
                        setBrand(e.target.value);
                        setModel("");
                      }} 
                      className={`block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${isLoadingBrands ? 'opacity-50' : ''}`}
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
                </div>

                {/* Model */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <div className="relative">
                    <select 
                      value={model} 
                      onChange={(e) => setModel(e.target.value)} 
                      className={`block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${isLoadingModels || !brand ? 'opacity-50' : ''}`}
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
                </div>

                {/* Fuel Type */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select 
                    value={fuelType} 
                    onChange={(e) => setFuelType(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Fuel Types</option>
                    {fuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Status */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Status</label>
                  <select 
                    value={isNew} 
                    onChange={(e) => setIsNew(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {isNewOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Year Range */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={yearMin} 
                      onChange={(e) => setYearMin(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">From</option>
                      {yearOptions.map((year) => (
                        <option key={`min-${year}`} value={year}>{year}</option>
                      ))}
                    </select>
                    <select 
                      value={yearMax} 
                      onChange={(e) => setYearMax(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">To</option>
                      {yearOptions.map((year) => (
                        <option key={`max-${year}`} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (€)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={priceMin} 
                      onChange={(e) => setPriceMin(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">From</option>
                      {priceOptions.map((price) => (
                        <option key={`min-${price}`} value={price}>{Number(price).toLocaleString()}</option>
                      ))}
                    </select>
                    <select 
                      value={priceMax} 
                      onChange={(e) => setPriceMax(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">To</option>
                      {priceOptions.map((price) => (
                        <option key={`max-${price}`} value={price}>{Number(price).toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mileage Range */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage Range (km)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={mileageMin} 
                      onChange={(e) => setMileageMin(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">From</option>
                      {mileageOptions.map((km) => (
                        <option key={`min-${km}`} value={km}>{Number(km).toLocaleString()}</option>
                      ))}
                    </select>
                    <select 
                      value={mileageMax} 
                      onChange={(e) => setMileageMax(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">To</option>
                      {mileageOptions.map((km) => (
                        <option key={`max-${km}`} value={km}>{Number(km).toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Engine Power Range */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engine Power (HP)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={enginePowerMin} 
                      onChange={(e) => setEnginePowerMin(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">From</option>
                      {powerOptions.map((hp) => (
                        <option key={`min-${hp}`} value={hp}>{Number(hp).toLocaleString()}</option>
                      ))}
                    </select>
                    <select 
                      value={enginePowerMax} 
                      onChange={(e) => setEnginePowerMax(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">To</option>
                      {powerOptions.map((hp) => (
                        <option key={`max-${hp}`} value={hp}>{Number(hp).toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Engine Capacity Range */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engine Capacity (cc)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={engineCapacityMin} 
                      onChange={(e) => setEngineCapacityMin(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">From</option>
                      {capacityOptions.map((cc) => (
                        <option key={`min-${cc}`} value={cc}>{Number(cc).toLocaleString()}</option>
                      ))}
                    </select>
                    <select 
                      value={engineCapacityMax} 
                      onChange={(e) => setEngineCapacityMax(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">To</option>
                      {capacityOptions.map((cc) => (
                        <option key={`max-${cc}`} value={cc}>{Number(cc).toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seller Type */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller Type</label>
                  <select 
                    value={sellerType} 
                    onChange={(e) => setSellerType(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Sellers</option>
                    {sellerTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Deal Rating */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Rating</label>
                  <select 
                    value={dealRating} 
                    onChange={(e) => setDealRating(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Any Deal</option>
                    <option value="S">Exceptional (S)</option>
                    <option value="A">Very Good (A)</option>
                    <option value="B">Good (B)</option>
                    <option value="C">Fair (C)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Body Type */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
                  <select 
                    value={driveType} 
                    onChange={(e) => setDriveType(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Body Types</option>
                    {driveTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Transmission */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                  <select 
                    value={transmission} 
                    onChange={(e) => setTransmission(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Transmissions</option>
                    {transmissionTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Colors</option>
                    {colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Doors */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Doors</label>
                  <select 
                    value={doors} 
                    onChange={(e) => setDoors(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    {doorOptions.map((d) => (
                      <option key={d} value={d}>{d} doors</option>
                    ))}
                  </select>
                </div>

                {/* Emission Standard */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emission Standard</label>
                  <select 
                    value={emissionStandard} 
                    onChange={(e) => setEmissionStandard(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Standards</option>
                    {emissionStandards.map((std) => (
                      <option key={std} value={std}>{std}</option>
                    ))}
                  </select>
                </div>

                {/* Country of Origin */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
                  <select 
                    value={originCountry} 
                    onChange={(e) => setOriginCountry(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">All Countries</option>
                    {originCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Quality Score Range */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={qualityScoreMin} 
                      onChange={(e) => setQualityScoreMin(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">Minimum</option>
                      {scoreOptions.map((score) => (
                        <option key={`min-${score}`} value={score}>{score}</option>
                      ))}
                    </select>
                    <select 
                      value={qualityScoreMax} 
                      onChange={(e) => setQualityScoreMax(e.target.value)} 
                      className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">Maximum</option>
                      {scoreOptions.map((score) => (
                        <option key={`max-${score}`} value={score}>{score}</option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Quality score represents overall vehicle condition from 0-100</p>
                </div>
              </div>
            )}

            {activeTab === "condition" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Right Hand Drive */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Right Hand Drive</label>
                  <select 
                    value={rightHandDrive} 
                    onChange={(e) => setRightHandDrive(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {booleanOptions.map((opt) => (
                      <option key={`rhd-${opt.value}`} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Damaged */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Damaged</label>
                  <select 
                    value={damaged} 
                    onChange={(e) => setDamaged(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {booleanOptions.map((opt) => (
                      <option key={`damaged-${opt.value}`} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* First Owner */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Owner</label>
                  <select 
                    value={firstOwner} 
                    onChange={(e) => setFirstOwner(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {booleanOptions.map((opt) => (
                      <option key={`first-owner-${opt.value}`} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* No Accident */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">No Accident History</label>
                  <select 
                    value={noAccident} 
                    onChange={(e) => setNoAccident(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {booleanOptions.map((opt) => (
                      <option key={`no-accident-${opt.value}`} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Service Book */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Book</label>
                  <select 
                    value={serviceBook} 
                    onChange={(e) => setServiceBook(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {booleanOptions.map((opt) => (
                      <option key={`service-book-${opt.value}`} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Registered */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registered</label>
                  <select 
                    value={registered} 
                    onChange={(e) => setRegistered(e.target.value)} 
                    className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {booleanOptions.map((opt) => (
                      <option key={`registered-${opt.value}`} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-8 mb-6 text-center">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gray-100">
                {isLoadingCount ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-blue-600" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="font-medium">Searching...</span>
                  </div>
                ) : (
                  <span className={`font-bold text-xl ${carsCount === 0 ? 'text-red-500' : 'text-blue-600'}`}>
                    {carsCount !== null ? `${carsCount.toLocaleString()} cars match your criteria` : 'Error counting cars'}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Show Results
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setIsSaveDialogOpen(true)}
                className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={!isLoggedIn}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save Search
                </span>
              </button>
              
              <button
                type="button"
                onClick={clearFilters}
                className="px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Save Search Dialog */}
        {isSaveDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Save Your Search</h3>
              
              {!isLoggedIn ? (
                <div>
                  <p className="mb-4">Please log in to save your search criteria.</p>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setIsSaveDialogOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-4">Save your current search criteria to easily access it later.</p>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <button 
                      onClick={() => setIsSaveDialogOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Save Search
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Search Tips</h3>
          <ul className="text-blue-700 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Leave fields empty for broader results. Each filter narrows down your search.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Quality Score is our proprietary rating of vehicle quality from 0-100.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Deal Rating shows how a car's price compares to the market. S-rated cars offer the best value.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Save your searches to quickly access them later (requires login).</span>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  );
}