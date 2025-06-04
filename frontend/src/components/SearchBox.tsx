"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrandsModels } from '@/hooks/useBrandsModels';

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "CNG", "Plug-in Hybrid"];
const vehicleConditions = [
  { label: "All", value: "" },
  { label: "New", value: "New" },
  { label: "Used", value: "Used" }
];
const dealRatings = [
  { label: "Any Deal", value: "" },
  { label: "Exceptional (S)", value: "S" },
  { label: "Very Good (A)", value: "A" },
  { label: "Good (B)", value: "B" },
];
const maxPrices = [1000, 2000, 5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000];
const maxMileages = [10000, 25000, 50000, 75000, 100000, 150000, 200000];
const yearsFrom = Array.from({ length: 2024 - 1990 + 1 }, (_, i) => 1990 + i);

const SearchBox = () => {
  const router = useRouter();

  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [maxMileage, setMaxMileage] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [totalCars, setTotalCars] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { brands, models, isLoadingBrands, isLoadingModels, fetchModels } = useBrandsModels();

  useEffect(() => {
    setIsLoading(true);

    const debounceTimer = setTimeout(() => {
      const params = new URLSearchParams();

      if (selectedBrand) params.append("brand", selectedBrand);
      if (selectedModel) params.append("model", selectedModel);
      if (selectedFuel) params.append("fuel_type", selectedFuel);
      if (selectedCondition) params.append("vehicle_condition", selectedCondition);
      if (selectedRating) params.append("deal_rating", selectedRating);
      if (yearFrom) params.append("year_min", yearFrom);
      if (maxMileage) params.append("mileage_max", maxMileage);
      if (maxPrice) params.append("max_price", maxPrice);

      fetch(`http://localhost:8000/cars/count?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setTotalCars(data.total || 0);
          setIsLoading(false);
        })
        .catch(() => {
          setTotalCars(null);
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedCondition, selectedBrand, selectedModel, selectedFuel, selectedRating, yearFrom, maxMileage, maxPrice]);

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
    if (selectedCondition) params.append("vehicle_condition", selectedCondition);
    if (selectedRating) params.append("deal_rating", selectedRating);
    if (yearFrom) params.append("year_min", yearFrom);
    if (maxMileage) params.append("mileage_max", maxMileage);
    if (maxPrice) params.append("max_price", maxPrice);

    router.push(`/listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCondition("");
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedFuel("");
    setSelectedRating("");
    setYearFrom("");
    setMaxMileage("");
    setMaxPrice("");
  };

  const getResultsColor = () => {
    if (totalCars === null || isLoading) return "text-gray-400";
    if (totalCars === 0) return "text-red-500";
    if (totalCars < 10) return "text-orange-500";
    if (totalCars < 50) return "text-yellow-600";
    return "text-green-600";
  };

  // Format total cars with dots for thousand separators
  const formatTotalCars = (total: number) => {
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand);
      setSelectedModel("");
    }
  }, [selectedBrand, fetchModels]);

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand);
      setSelectedModel("");
    }
  }, [selectedBrand, fetchModels]);

  return (
    <form onSubmit={handleSearch} className="bg-white bg-opacity-95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-2xl space-y-5 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">Find Your Perfect Car</h3>
        <p className="text-sm text-gray-500">Advanced search with market analysis</p>
      </div>

      {/* Condition Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {vehicleConditions.map((condition) => (
          <button
            key={condition.value}
            type="button"
            onClick={() => setSelectedCondition(condition.value)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCondition === condition.value
              ? "bg-blue-600 text-white shadow"
              : "bg-white text-gray-700 border border-gray-300 hover:border-blue-300 hover:shadow-sm"
              }`}
          >
            {condition.label}
          </button>
        ))}
      </div>

      {/* Main filters grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Brand</label>
          <select
            value={selectedBrand}
            onChange={handleBrandChange}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800 ${isLoadingBrands ? 'opacity-50' : ''}`}
            disabled={isLoadingBrands}
          >
            <option value="">All Brands</option>
            {isLoadingBrands ? (
              <option value="" disabled>Loading brands...</option>
            ) : (
              brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))
            )}
          </select>
          {isLoadingBrands && (
            <div className="absolute right-2 top-8">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Model */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand || isLoadingModels}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 ${isLoadingModels ? 'opacity-50' : ''}`}
          >
            <option value="">All Models</option>
            {isLoadingModels ? (
              <option value="" disabled>Loading models...</option>
            ) : (
              models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))
            )}
          </select>
          {isLoadingModels && (
            <div className="absolute right-2 top-8">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Fuel Type */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Fuel Type</label>
          <select
            value={selectedFuel}
            onChange={(e) => setSelectedFuel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">All Fuel Types</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </select>
        </div>

        {/* Deal Rating */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Deal Rating</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            {dealRatings.map((rating) => (
              <option key={rating.value} value={rating.value}>
                {rating.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Year From</label>
          <select
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">Any Year</option>
            {yearsFrom.map((year) => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>

        {/* Max Mileage */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Max Mileage</label>
          <select
            value={maxMileage}
            onChange={(e) => setMaxMileage(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">No Limit</option>
            {maxMileages.map((km) => (
              <option key={km} value={km.toString()}>{km.toLocaleString()} km</option>
            ))}
          </select>
        </div>

        {/* Max Price - Full width */}
        <div className="relative md:col-span-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Max Price</label>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">No Limit</option>
            {maxPrices.map((price) => (
              <option key={price} value={price.toString()}>€{price.toLocaleString()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results counter */}
      <div className="text-center py-2">
        <div className={`text-xl font-bold ${getResultsColor()}`}>
          {isLoading ? (
            <div className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              Searching...
            </div>
          ) : totalCars !== null ? (
            `${formatTotalCars(totalCars)} Cars Found`
          ) : (
            "Search Failed"
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Cars
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams();

            if (selectedBrand) params.append("brand", selectedBrand);
            if (selectedModel) params.append("model", selectedModel);
            if (selectedFuel) params.append("fuel_type", selectedFuel);
            if (selectedCondition) params.append("vehicle_condition", selectedCondition);
            if (selectedRating) params.append("deal_rating", selectedRating);
            if (yearFrom) params.append("year_min", yearFrom);
            if (maxMileage) params.append("mileage_max", maxMileage);
            if (maxPrice) params.append("max_price", maxPrice);

            const queryString = params.toString();
            if (queryString) {
              router.push(`/detailed-search?${queryString}`);
            } else {
              router.push("/detailed-search");
            }
          }}
          className="sm:w-auto bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
        >
          Advanced Search
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="sm:w-auto bg-gray-100 text-gray-600 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all shadow-sm"
        >
          Clear
        </button>
      </div>

      {/* Quick tip */}
      <div className="text-center text-xs text-gray-400 mt-2">
        Tip: Leave fields empty for broader search results
      </div>
    </form>
  );
};

export default SearchBox;