"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { useBrandsModels } from '@/hooks/useBrandsModels';
import IntlProvider from '@/components/IntlProvider';

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG", "CNG", "Plug-in Hybrid"];

function SearchBoxContent() {
  const t = useTranslations('search');
  const locale = useLocale();
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
  const [availableCars, setAvailableCars] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { brands, models, isLoadingBrands, isLoadingModels, fetchModels } = useBrandsModels();

  const vehicleConditions = [
    { label: t('all'), value: "" },
    { label: t('new'), value: "New" },
    { label: t('used'), value: "Used" }
  ];
  const dealRatings = [
    { label: t('anyDeal'), value: "" },
    { label: t('exceptional'), value: "S" },
    { label: t('veryGood'), value: "A" },
    { label: t('good'), value: "B" },
  ];
  const maxPrices = [1000, 2000, 5000, 10000, 15000, 20000, 30000, 50000, 75000, 100000];
  const maxMileages = [10000, 25000, 50000, 75000, 100000, 150000, 200000];
  const yearsFrom = Array.from({ length: 2024 - 1990 + 1 }, (_, i) => 1990 + i);

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
        .then(res => res.json())
        .then(data => {
          setTotalCars(data.total || 0);

          const availableParams = new URLSearchParams(params);
          availableParams.set("sold", "false");

          return fetch(`http://localhost:8000/cars/count?${availableParams.toString()}`);
        })
        .then(res => res.json())
        .then(data => {
          setAvailableCars(data.total || 0);
          setIsLoading(false);
        })
        .catch(() => {
          setTotalCars(null);
          setAvailableCars(null);
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

    router.push(`/${locale}/listings?${params.toString()}`);
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
    if (availableCars === null || isLoading) return "text-gray-400";
    if (availableCars === 0) return "text-red-500";
    if (availableCars < 10) return "text-orange-500";
    if (availableCars < 50) return "text-yellow-600";
    return "text-green-600";
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
        <h3 className="text-xl font-bold text-gray-800 mb-1">{t('findPerfectCar')}</h3>
        <p className="text-sm text-gray-500">{t('advancedSearchAnalysis')}</p>
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
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('brand')}</label>
          <select
            value={selectedBrand}
            onChange={handleBrandChange}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800 ${isLoadingBrands ? 'opacity-50' : ''}`}
            disabled={isLoadingBrands}
          >
            <option value="">{t('allBrands')}</option>
            {isLoadingBrands ? (
              <option value="" disabled>{t('loadingBrands')}</option>
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
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('model')}</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand || isLoadingModels}
            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 ${isLoadingModels ? 'opacity-50' : ''}`}
          >
            <option value="">{t('allModels')}</option>
            {isLoadingModels ? (
              <option value="" disabled>{t('loadingModels')}</option>
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
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('fuelType')}</label>
          <select
            value={selectedFuel}
            onChange={(e) => setSelectedFuel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">{t('allFuelTypes')}</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>{fuel}</option>
            ))}
          </select>
        </div>

        {/* Deal Rating */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('dealRating')}</label>
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
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('yearFrom')}</label>
          <select
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">{t('anyYear')}</option>
            {yearsFrom.map((year) => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>

        {/* Max Mileage */}
        <div className="relative">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('maxMileage')}</label>
          <select
            value={maxMileage}
            onChange={(e) => setMaxMileage(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">{t('noLimit')}</option>
            {maxMileages.map((km) => (
              <option key={km} value={km.toString()}>{km.toLocaleString()} km</option>
            ))}
          </select>
        </div>

        {/* Max Price - Full width */}
        <div className="relative md:col-span-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{t('maxPrice')}</label>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-800"
          >
            <option value="">{t('noLimit')}</option>
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
              {t('searching')}
            </div>
          ) : availableCars !== null && totalCars !== null ? (
            <div className="space-y-1">
              <div className="text-xl font-bold">
                {formatNumber(availableCars)} {t('availableCars')}
              </div>
              <div className="text-sm text-gray-500 font-normal">
                {formatNumber(totalCars)} {t('totalCars')} • {formatNumber(totalCars - availableCars)} {t('sold')}
              </div>
            </div>
          ) : (
            t('searchFailed')
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
            {t('searchCars')}
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
              router.push(`/${locale}/detailed-search?${queryString}`);
            } else {
              router.push(`/${locale}/detailed-search`);
            }
          }}
          className="sm:w-auto bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
        >
          {t('advancedSearch')}
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="sm:w-auto bg-gray-100 text-gray-600 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all shadow-sm"
        >
          {t('clear')}
        </button>
      </div>

      {/* Quick tip */}
      <div className="text-center text-xs text-gray-400 mt-2">
        {t('tip')}
      </div>
    </form>
  );
}

const SearchBox = () => {
  return (
    <IntlProvider>
      <SearchBoxContent />
    </IntlProvider>
  );
};

export default SearchBox;