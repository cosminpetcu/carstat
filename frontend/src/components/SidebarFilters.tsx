"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const vehicleConditionMap = {
  "New": "New",
  "Used": "Used"
};

const fuelTypeMap = {
  "Petrol": "Petrol",
  "Diesel": "Diesel",
  "Hybrid": "Hybrid",
  "Plug-in Hybrid": "Plug-in Hybrid",
  "LPG": "LPG/GPL",
  "CNG": "CNG",
  "Electric": "Electric"
};

const transmissionMap = {
  "Manual": "Manual",
  "Automatic": "Automatic"
};


// Filter options constants
const driveTypes = ["Sedan", "SUV", "Wagon", "Hatchback", "MPV", "Coupe", "Convertible", "Pickup"];
const colorOptions = ["Black", "Grey", "White", "Blue", "Red", "Silver", "Brown", "Beige", "Green", "Yellow/Gold", "Orange", "Other"];
const sellerTypes = ["Private", "Dealer"];

// Deal Rating with descriptions
const dealRatings = [
  { value: "", label: "Any Deal" },
  { value: "S", label: "S - Exceptional Price" },
  { value: "A", label: "A - Very Good Price" },
  { value: "B", label: "B - Good Price" },
  { value: "C", label: "C - Fair Price" },
  { value: "D", label: "D - Expensive" },
  { value: "E", label: "E - Very Expensive" },
  { value: "F", label: "F - Overpriced" }
];

const priceOptions = [1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 70000, 100000, 150000];
const yearsOptions = Array.from({ length: 2024 - 1990 + 1 }, (_, i) => 2024 - i);
const mileageOptions = [1000, 5000, 10000, 25000, 50000, 75000, 100000, 150000, 200000, 300000];
const doorsOptions = [2, 3, 4, 5, 6];
const engineCapacityOptions = [1000, 1200, 1400, 1600, 1800, 2000, 2500, 3000, 4000, 5000];
const enginePowerOptions = [50, 75, 100, 150, 200, 250, 300, 400, 500];

export default function SidebarFilters({ setToastMessage, setToastType }: { setToastMessage: (msg: string) => void, setToastType: (type: "success" | "error" | "") => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for all filter values
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    fuel_type: "",
    vehicle_condition: "",
    transmission: "",
    seller_type: "",
    drive_type: "",
    color: "",
    deal_rating: "",
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
    doors: "",
    sold: "",
    quality_score_min: "",
    quality_score_max: ""
  });

  // Collapsed state for expandable sections
  const [isCollapsed, setIsCollapsed] = useState({
    basic: false,         // Essential filters
    availability: true,   // Availability settings
    vehicle: true,        // Vehicle characteristics
    engine: true,         // Engine specifications
    pricing: true         // Pricing information
  });

  const qualityScoreRanges = [
    { label: "Any Quality", value: "any", min: "", max: "" },
    { label: "Excellent (80-100)", value: "excellent", min: "80", max: "100" },
    { label: "Good (60-79)", value: "good", min: "60", max: "79" },
    { label: "Average (40-59)", value: "average", min: "40", max: "59" },
    { label: "Below Average (20-39)", value: "below_average", min: "20", max: "39" },
    { label: "Poor (0-19)", value: "poor", min: "0", max: "19" }
  ];

  // Toggle a section's collapsed state
  const toggleSection = (section: keyof typeof isCollapsed) => {
    setIsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Initialize filters from URL params on component mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = { ...filters };
    
    // For each filter, check if it exists in URL params and update state
    Object.keys(newFilters).forEach((key) => {
      const paramValue = params.get(key);
      if (paramValue !== null) {
        newFilters[key as keyof typeof filters] = paramValue;
      } else {
        newFilters[key as keyof typeof filters] = "";
      }
    });
    
    setFilters(newFilters);
  }, [searchParams]);

  // Save search functionality
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

  // Update a single filter and navigate
  const updateFilter = (key: string, value: string) => {
    // Create a copy of current filters and update the specified key
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    
    // Build URL parameters
    const params = new URLSearchParams();
    
    // Add all non-empty filters to URL params
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Reset to page 1 when changing filters
    params.set("page", "1");
    
    // Navigate to updated URL
    router.push(`/listings?${params.toString()}`);
  };

  // Update multiple filters at once (for price ranges)
  const updateMultipleFilters = (updates: Record<string, string>) => {
    // Create a copy of current filters and apply all updates
    const updatedFilters = { ...filters, ...updates };
    setFilters(updatedFilters);
    
    // Build URL parameters
    const params = new URLSearchParams();
    
    // Add all non-empty filters to URL params
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Reset to page 1 when changing filters
    params.set("page", "1");
    
    // Navigate to updated URL
    router.push(`/listings?${params.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      brand: "",
      model: "",
      fuel_type: "",
      vehicle_condition: "",
      transmission: "",
      seller_type: "",
      drive_type: "",
      color: "",
      deal_rating: "",
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
      doors: "",
      sold: "",
      quality_score_min: "",
      quality_score_max: ""
    });
    router.push('/listings');
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
          setToastMessage('Failed to load brands from server');
          setToastType('error');
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setToastMessage('Error connecting to server');
        setToastType('error');
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    if (!filters.brand) {
      setAvailableModels([]);
      return;
    }

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch(`http://localhost:8000/analytics/available-models/${filters.brand}`);
        if (response.ok) {
          const models = await response.json();
          setAvailableModels(models);
        } else {
          console.error('Failed to fetch models');
          setToastMessage('Failed to load models from server');
          setToastType('error');
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setToastMessage('Error connecting to server');
        setToastType('error');
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [filters.brand]);

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
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Brand</label>
                <div className="relative">
                  <select 
                    value={filters.brand} 
                    onChange={(e) => {
                      // When changing brand, also reset model
                      if (e.target.value !== filters.brand) {
                        updateMultipleFilters({
                          brand: e.target.value,
                          model: ""
                        });
                      } else {
                        updateFilter("brand", e.target.value);
                      }
                    }}
                    className={`w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none ${isLoadingBrands ? 'opacity-50' : ''}`}
                    disabled={isLoadingBrands}
                  >
                    <option value="">All Brands</option>
                    {isLoadingBrands ? (
                      <option value="" disabled>Loading brands...</option>
                    ) : (
                      availableBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  {isLoadingBrands && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Model */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Model</label>
                <div className="relative">
                  <select 
                    value={filters.model} 
                    onChange={(e) => updateFilter("model", e.target.value)} 
                    className={`w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none ${isLoadingModels || !filters.brand ? 'opacity-50' : ''}`}
                    disabled={isLoadingModels || !filters.brand}
                  >
                    <option value="">All Models</option>
                    {isLoadingModels ? (
                      <option value="" disabled>Loading models...</option>
                    ) : (
                      availableModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <ParkingIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  {isLoadingModels && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Vehicle Condition */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Vehicle Condition</label>
                <div className="relative">
                  <select 
                    value={filters.vehicle_condition} 
                    onChange={(e) => updateFilter("vehicle_condition", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">All Conditions</option>
                    {Object.entries(vehicleConditionMap).map(([display, value]) => (
                      <option key={value} value={value}>{display}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Fuel Type */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Fuel Type</label>
                <div className="relative">
                  <select 
                    value={filters.fuel_type} 
                    onChange={(e) => updateFilter("fuel_type", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">All Fuel Types</option>
                    {Object.entries(fuelTypeMap).map(([display, value]) => (
                      <option key={value} value={value}>{display}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FuelIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Transmission */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Transmission</label>
                <div className="relative">
                  <select 
                    value={filters.transmission} 
                    onChange={(e) => updateFilter("transmission", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">All Transmissions</option>
                    {Object.entries(transmissionMap).map(([display, value]) => (
                      <option key={value} value={value}>{display}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <TransmissionIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Availability & Deal Rating Section */}
        <div className="border-b border-gray-700 pb-4">
          <button 
            className="flex justify-between items-center w-full text-left mb-3 font-semibold text-lg"
            onClick={() => toggleSection('availability')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              Availability & Deal
            </span>
            <span>{isCollapsed.availability ? '▼' : '▲'}</span>
          </button>
          
          {!isCollapsed.availability && (
            <div className="space-y-3 pl-2">
              {/* Seller Type */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Seller Type</label>
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
              </div>

              {/* Sold Status */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Availability</label>
                <div className="relative">
                  <select 
                    value={filters.sold} 
                    onChange={(e) => updateFilter("sold", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">All Cars</option>
                    <option value="false">Available Only</option>
                    <option value="true">Sold Only</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Deal Rating */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Deal Rating</label>
                <div className="relative">
                  <select 
                    value={filters.deal_rating} 
                    onChange={(e) => updateFilter("deal_rating", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    {dealRatings.map((rating) => (
                      <option key={rating.value} value={rating.value}>
                        {rating.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quality Score */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Quality Score</label>
                <div className="relative">
                  <select 
                    value={qualityScoreRanges.find(
                      range => range.min === filters.quality_score_min && range.max === filters.quality_score_max
                    )?.value || "any"}
                    onChange={(e) => {
                      const selectedRange = qualityScoreRanges.find(range => range.value === e.target.value);
                      if (selectedRange) {
                        updateMultipleFilters({
                          quality_score_min: selectedRange.min,
                          quality_score_max: selectedRange.max
                        });
                      }
                    }} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    {qualityScoreRanges.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Characteristics Section */}
        <div className="border-b border-gray-700 pb-4">
          <button 
            className="flex justify-between items-center w-full text-left mb-3 font-semibold text-lg"
            onClick={() => toggleSection('vehicle')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5" />
                <path d="M21 3l-7 7" />
                <path d="M3 8v13h13" />
                <path d="M13 8a5 5 0 1 0-5 5" />
              </svg>
              Vehicle Specs
            </span>
            <span>{isCollapsed.vehicle ? '▼' : '▲'}</span>
          </button>
          
          {!isCollapsed.vehicle && (
            <div className="space-y-3 pl-2">
              {/* Drive Type */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Body Type</label>
                <div className="relative">
                  <select 
                    value={filters.drive_type} 
                    onChange={(e) => updateFilter("drive_type", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">All Body Types</option>
                    {driveTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CarIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Doors */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Doors</label>
                <div className="relative">
                  <select 
                    value={filters.doors} 
                    onChange={(e) => updateFilter("doors", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">Any Number</option>
                    {doorsOptions.map((doors) => (
                      <option key={doors} value={doors.toString()}>{doors} doors</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Color */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Color</label>
                <div className="relative">
                  <select 
                    value={filters.color} 
                    onChange={(e) => updateFilter("color", e.target.value)} 
                    className="w-full rounded-lg p-2.5 pl-10 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                  >
                    <option value="">Any Color</option>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
                      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Year Range */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Year Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select 
                      value={filters.year_min} 
                      onChange={(e) => updateFilter("year_min", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">From</option>
                      {yearsOptions.map((year) => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.year_max} 
                      onChange={(e) => updateFilter("year_max", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">To</option>
                      {yearsOptions.map((year) => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Mileage Range */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Mileage Range (km)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select 
                      value={filters.mileage_min} 
                      onChange={(e) => updateFilter("mileage_min", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">From</option>
                      {mileageOptions.map((mileage) => (
                        <option key={mileage} value={mileage.toString()}>{mileage.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.mileage_max} 
                      onChange={(e) => updateFilter("mileage_max", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">To</option>
                      {mileageOptions.map((mileage) => (
                        <option key={mileage} value={mileage.toString()}>{mileage.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Engine Specifications Section */}
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
              {/* Engine Power Range */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Engine Power (hp)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select 
                      value={filters.engine_power_min} 
                      onChange={(e) => updateFilter("engine_power_min", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">From</option>
                      {enginePowerOptions.map((power) => (
                        <option key={power} value={power.toString()}>{power}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.engine_power_max} 
                      onChange={(e) => updateFilter("engine_power_max", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">To</option>
                      {enginePowerOptions.map((power) => (
                        <option key={power} value={power.toString()}>{power}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Engine Capacity Range */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Engine Capacity (cc)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select 
                      value={filters.engine_capacity_min} 
                      onChange={(e) => updateFilter("engine_capacity_min", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">From</option>
                      {engineCapacityOptions.map((capacity) => (
                        <option key={capacity} value={capacity.toString()}>{capacity}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.engine_capacity_max} 
                      onChange={(e) => updateFilter("engine_capacity_max", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">To</option>
                      {engineCapacityOptions.map((capacity) => (
                        <option key={capacity} value={capacity.toString()}>{capacity}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="border-b border-gray-700 pb-4">
          <button 
            className="flex justify-between items-center w-full text-left mb-3 font-semibold text-lg"
            onClick={() => toggleSection('pricing')}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Price Range
            </span>
            <span>{isCollapsed.pricing ? '▼' : '▲'}</span>
          </button>
          
          {!isCollapsed.pricing && (
            <div className="space-y-3 pl-2">
              {/* Price Range */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Price Range (€)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select 
                      value={filters.min_price} 
                      onChange={(e) => updateFilter("min_price", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">Min Price</option>
                      {priceOptions.map((price) => (
                        <option key={price} value={price.toString()}>€{price.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <select 
                      value={filters.max_price} 
                      onChange={(e) => updateFilter("max_price", e.target.value)} 
                      className="w-full rounded-lg p-2.5 bg-gray-800 border border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none text-sm"
                    >
                      <option value="">Max Price</option>
                      {priceOptions.map((price) => (
                        <option key={price} value={price.toString()}>€{price.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Price by ranges */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Quick Ranges</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateMultipleFilters({
                      min_price: "",
                      max_price: "5000"
                    })}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    Under €5,000
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMultipleFilters({
                      min_price: "5000",
                      max_price: "10000"
                    })}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    €5,000 - €10,000
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMultipleFilters({
                      min_price: "10000",
                      max_price: "20000"
                    })}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    €10,000 - €20,000
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMultipleFilters({
                      min_price: "20000",
                      max_price: ""
                    })}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    Over €20,000
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
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