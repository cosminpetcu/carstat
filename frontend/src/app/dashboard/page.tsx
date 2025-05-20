"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Pie, 
  Bar,
  Line
} from "react-chartjs-2";
import { 
  Chart, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from "chart.js";

Chart.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

import {
  Deal,
  LocationStat,
  RatingStat,
  BrandStat,
  ModelStat,
  PriceStat,
  MarketSummary,
  PriceDropStat,
  DetailedPriceStat,
  QualityScoreItem,
  QualitySellTimeItem,
  QualityPriceReductionItem,
  LocationItem,
  OriginCountryAnalysisData,
  DealerVsPrivateData,
  BrandReliabilityItem,
  ModelDepreciation,
  GenerationAnalysis,
  ModelsMap,
  MileageImpactItem,
  SuspiciousListingsData,
  GenerationAnalysisItem,
  ModelDepreciationItem
} from '@/app/types/dashboard';


export default function Dashboard() {
  const [topDeals, setTopDeals] = useState<Deal[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStat[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStat[]>([]);
  const [brandStats, setBrandStats] = useState<BrandStat[]>([]);
  const [modelStats, setModelStats] = useState<ModelStat[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStat[]>([]);
  const [priceDropStats, setPriceDropStats] = useState<{
    averagePriceDrop: number;
    averagePercentageDrop: number;
    carsWithPriceDrops: number;
    biggestDrops: PriceDropStat[];
  }>({
    averagePriceDrop: 0,
    averagePercentageDrop: 0,
    carsWithPriceDrops: 0,
    biggestDrops: []
  });
  const [detailedPriceStats, setDetailedPriceStats] = useState<DetailedPriceStat>({
    brandPrices: [],
    yearPrices: [],
    fuelPrices: [],
    transmissionPrices: []
  });
  const [marketSummary, setMarketSummary] = useState<MarketSummary>({
    totalListings: 0,
    totalSold: 0,
    activeListings: 0,
    averageSellTime: 0,
    averagePrice: 0
  });
  const [qualityScoreDistribution, setQualityScoreDistribution] = useState<QualityScoreItem[]>([]);
  const [qualityScoreVsSellTime, setQualityScoreVsSellTime] = useState<QualitySellTimeItem[]>([]);
  const [qualityScoreVsPriceReduction, setQualityScoreVsPriceReduction] = useState<QualityPriceReductionItem[]>([]);
  const [locationHeatmap, setLocationHeatmap] = useState<LocationItem[]>([]);
  const [originCountryAnalysis, setOriginCountryAnalysis] = useState<OriginCountryAnalysisData>({
    priceByOrigin: [],
    sellTimeByOrigin: [],
    topBrandsByOrigin: {}
  });
  const [dealerVsPrivate, setDealerVsPrivate] = useState<DealerVsPrivateData>({
    generalStats: [],
    dealRatings: [],
    qualityScores: []
  });
  const [brandReliability, setBrandReliability] = useState<BrandReliabilityItem[]>([]);
  const [modelDepreciation, setModelDepreciation] = useState<ModelDepreciationItem[]>([]);
  const [generationAnalysis, setGenerationAnalysis] = useState<GenerationAnalysisItem[]>([]);
  const [mileageImpact, setMileageImpact] = useState<MileageImpactItem[]>([]);
  const [selectedDepreciationModel, setSelectedDepreciationModel] = useState(modelDepreciation[0] || null);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedGenerationModel, setSelectedGenerationModel] = useState(generationAnalysis[0] || null);
  const [selectedGenBrand, setSelectedGenBrand] = useState("");
  const [selectedGenModel, setSelectedGenModel] = useState("");
  const [suspiciousListings, setSuspiciousListings] = useState<SuspiciousListingsData | null>(null);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelsMap>({});
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const suspiciousListingsData = suspiciousListings || {
    totalSuspicious: 0,
    totalListings: 0,
    suspiciousPercentage: 0,
    factorComparisons: [],
    specificFactors: {
      rightHandDrive: { suspiciousPercentage: 0, normalPercentage: 0, difference: 0 },
      damaged: { suspiciousPercentage: 0, normalPercentage: 0, difference: 0 },
      privateSellers: { suspiciousPercentage: 0, normalPercentage: 0, difference: 0 }
    },
    priceStatistics: {
      suspicious: { avgPrice: null, minPrice: null, maxPrice: null },
      normal: { avgPrice: null, minPrice: null, maxPrice: null }
    },
    topSuspiciousBrands: [],
    priceRangesSuspicious: [],
    incompleteStats: {
      totalIncomplete: 0,
      totalValid: 0,
      successRate: 0,
      sources: [],
      fieldsBreakdown: []
    }
  };
  const incompleteStats = suspiciousListingsData.incompleteStats;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const getRatingDetails = (rating: string) => {
    switch (rating.toUpperCase()) {
      case "S":
        return { label: "Exceptional Price", color: "#166534" };
      case "A":
        return { label: "Very Good Price", color: "#4d7c0f" };
      case "B":
        return { label: "Good Price", color: "#059669" };
      case "C":
        return { label: "Fair Price", color: "#facc15" };
      case "D":
        return { label: "Expensive", color: "#f97316" };
      case "E":
        return { label: "Very Expensive", color: "#f43f5e" };
      case "F":
        return { label: "Overpriced", color: "#b91c1c" };
      default:
        return { label: "Unknown", color: "#d1d5db" };
    }
  };


  const fetchModelDepreciationData = async (brand: string, model: string): Promise<ModelDepreciation | null> => {
    try {
      const response = await fetch(`http://localhost:8000/analytics/model-depreciation/${brand}/${model}`);
      if (!response.ok) {
        throw new Error(`Error fetching model depreciation data: ${response.statusText}`);
      }
      const data: ModelDepreciation = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch model depreciation data:", error);
      return null;
    }
  };

  const fetchGenerationAnalysisData = async (brand: string, model: string): Promise<GenerationAnalysis | null> => {
    try {
      const response = await fetch(`http://localhost:8000/analytics/generation-analysis/${brand}/${model}`);
      if (!response.ok) {
        throw new Error(`Error fetching generation analysis data: ${response.statusText}`);
      }
      const data: GenerationAnalysis = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch generation analysis data:", error);
      return null;
    }
  };

  useEffect(() => {
    fetch('http://localhost:8000/analytics/available-brands')
      .then(res => res.json())
      .then(data => {
        setAvailableBrands(data);
      })
      .catch(error => {
        console.error("Error fetching brands:", error);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    
    const fetchExistingData = async () => {
      try {
        const [topDealsRes, ratingStatsRes, locationStatsRes] = await Promise.all([
          fetch("http://localhost:8000/analytics/top-deals").then(res => res.json()),
          fetch("http://localhost:8000/analytics/deal-rating-distribution").then(res => res.json()),
          fetch("http://localhost:8000/analytics/top-locations").then(res => res.json())
        ]);
        
        setTopDeals(topDealsRes);
        setRatingStats(ratingStatsRes);
        setLocationStats(locationStatsRes);
      } catch (error) {
        console.error("Error fetching existing data:", error);
      }
    };
    
    const fetchNewData = async () => {
      try {
        const [brandStatsRes, modelStatsRes, priceStatsRes, marketSummaryRes, 
               priceDropStatsRes, detailedPriceStatsRes] = await Promise.all([
          fetch("http://localhost:8000/analytics/brand-stats").then(res => res.json()),
          fetch("http://localhost:8000/analytics/model-stats").then(res => res.json()),
          fetch("http://localhost:8000/analytics/price-stats").then(res => res.json()),
          fetch("http://localhost:8000/analytics/market-summary").then(res => res.json()),
          fetch("http://localhost:8000/analytics/price-drop-stats").then(res => res.json()),
          fetch("http://localhost:8000/analytics/detailed-price-stats").then(res => res.json())
        ]);
        
        setBrandStats(brandStatsRes);
        setModelStats(modelStatsRes);
        setPriceStats(priceStatsRes);
        setMarketSummary(marketSummaryRes);
        setPriceDropStats(priceDropStatsRes);
        setDetailedPriceStats(detailedPriceStatsRes);
      } catch (error) {
        console.error("Error fetching new data:", error);
      }
    };

    const fetchVehicleQualityData = async () => {
      try {
        const [distributionRes, sellTimeRes, priceReductionRes] = await Promise.all([
          fetch("http://localhost:8000/analytics/quality-score-distribution").then(res => res.json()),
          fetch("http://localhost:8000/analytics/quality-score-vs-sell-time").then(res => res.json()),
          fetch("http://localhost:8000/analytics/quality-score-vs-price-reduction").then(res => res.json())
        ]);
        
        setQualityScoreDistribution(distributionRes);
        setQualityScoreVsSellTime(sellTimeRes);
        setQualityScoreVsPriceReduction(priceReductionRes);
      } catch (error) {
        console.error("Error fetching vehicle quality data:", error);
      }
    };

    const fetchGeographicData = async () => {
      try {
        const [heatmapRes, originRes, dealerVsPrivateRes] = await Promise.all([
          fetch("http://localhost:8000/analytics/location-heatmap").then(res => res.json()),
          fetch("http://localhost:8000/analytics/origin-country-analysis").then(res => res.json()),
          fetch("http://localhost:8000/analytics/dealer-vs-private").then(res => res.json())
        ]);
        
        setLocationHeatmap(heatmapRes);
        setOriginCountryAnalysis(originRes);
        setDealerVsPrivate(dealerVsPrivateRes);
      } catch (error) {
        console.error("Error fetching geographic data:", error);
      }
    };

    const fetchBrandModelData = async () => {
      try {
        const [reliabilityRes, depreciationRes, generationRes] = await Promise.all([
          fetch("http://localhost:8000/analytics/brand-reliability").then(res => res.json()),
          fetch("http://localhost:8000/analytics/model-depreciation").then(res => res.json()),
          fetch("http://localhost:8000/analytics/generation-analysis").then(res => res.json())
        ]);
        
        setBrandReliability(reliabilityRes);
        setModelDepreciation(depreciationRes);
        setGenerationAnalysis(generationRes);
      } catch (error) {
        console.error("Error fetching brand/model data:", error);
      }
    };

    const fetchMileageData = async () => {
      try {
        const mileageData = await fetch("http://localhost:8000/analytics/mileage-impact").then(res => res.json());
        setMileageImpact(mileageData);
      } catch (error) {
        console.error("Error fetching mileage impact data:", error);
      }
    };

    const fetchSuspiciousData = async () => {
      try {
        const suspiciousData = await fetch("http://localhost:8000/analytics/suspicious-listings").then(res => res.json());
        setSuspiciousListings(suspiciousData);
      } catch (error) {
        console.error("Error fetching suspicious listings data:", error);
      }
    };
    
    Promise.all([
      fetchExistingData(), 
      fetchNewData(), 
      fetchVehicleQualityData(), 
      fetchGeographicData(),
      fetchBrandModelData(),
      fetchMileageData(),
      fetchSuspiciousData()
    ])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  const parseImage = (images: string[] | string) => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      return parsed?.[0] || "/default-car.webp";
    } catch {
      return "/default-car.webp";
    }
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ro-RO').format(num);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Analytics Data...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      {/* Market Summary Cards */}
      <section className="pt-8 px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Market Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-sm text-blue-700 font-medium mb-1">Total Listings</h3>
            <p className="text-3xl font-bold text-blue-900">{formatNumber(marketSummary.totalListings)}</p>
            <p className="text-sm text-blue-600 mt-2">
              {formatNumber(marketSummary.activeListings)} active cars
            </p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-100">
            <h3 className="text-sm text-green-700 font-medium mb-1">Sold Cars</h3>
            <p className="text-3xl font-bold text-green-900">{formatNumber(marketSummary.totalSold)}</p>
            <p className="text-sm text-green-600 mt-2">
              {((marketSummary.totalSold / marketSummary.totalListings) * 100).toFixed(1)}% of all listings
            </p>
          </div>
          
          <div className="bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100">
            <h3 className="text-sm text-amber-700 font-medium mb-1">Avg. Sell Time</h3>
            <p className="text-3xl font-bold text-amber-900">{marketSummary.averageSellTime} days</p>
            <p className="text-sm text-amber-600 mt-2">From listing to sale</p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6 shadow-sm border border-purple-100">
            <h3 className="text-sm text-purple-700 font-medium mb-1">Price Drops</h3>
            <p className="text-3xl font-bold text-purple-900">€{formatNumber(priceDropStats.averagePriceDrop)}</p>
            <p className="text-sm text-purple-600 mt-2">
              {priceDropStats.averagePercentageDrop.toFixed(1)}% average reduction
            </p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "all" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("brands")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "brands" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Brands & Models
          </button>
          <button 
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "pricing" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pricing Analysis
          </button>
          <button 
            onClick={() => setActiveTab("price-drops")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "price-drops" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Price Drops
          </button>
          <button 
            onClick={() => setActiveTab("vehicle-quality")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "vehicle-quality" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Vehicle Quality
          </button>
          <button 
            onClick={() => setActiveTab("geographic")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "geographic" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Geographic Analysis
          </button>
          <button 
            onClick={() => setActiveTab("mileage-impact")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "mileage-impact" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mileage Impact
          </button>
          <button 
            onClick={() => setActiveTab("suspicious")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "suspicious" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Suspicious & Incomplete Listings
          </button>
        </div>
      </section>

      {/* Overview Tab Content */}
      {activeTab === "all" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Exceptional Deals */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Top Exceptional Deals</h2>
          {topDeals.length > 0 ? (
            <ul className="space-y-4">
              {topDeals.map((car) => (
                <li key={car.id} className="flex gap-4 items-center border-b pb-4">
                  <img
                    src={parseImage(car.images)}
                    alt={car.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <a href={`/listings/${car.id}`} className="text-sm font-semibold hover:underline">
                      {car.title}
                    </a>
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        <p className="text-xs text-gray-500">
                          Est. Price: €{formatNumber(car.estimated_price)}
                        </p>
                        <p className="text-blue-600 font-bold text-sm">
                          €{formatNumber(car.price)}
                        </p>
                      </div>
                      <div className="flex items-center bg-green-100 px-2 py-1 rounded text-xs text-green-800">
                        <span className="font-bold mr-1">Save</span> 
                        {car.estimated_price && car.price ? 
                          `€${formatNumber(car.estimated_price - car.price)}` : 
                          "Great Deal"}
                      </div>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-600">
                      <span className="mr-2">{car.year}</span>
                      <span className="mr-2">•</span>
                      <span>{formatNumber(car.mileage)} km</span>
                      {car.deal_rating && (
                        <>
                          <span className="mr-2 ml-2">•</span>
                          <span className="bg-blue-100 text-blue-800 px-1 rounded">
                            {car.deal_rating} Rating
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No exceptional deals available</p>
          )}
        </div>

          {/* Rating Distribution */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
            {ratingStats.length === 0 ? (
              <p className="text-sm text-gray-500">No data available.</p>
            ) : (
              <Pie
                data={{
                  labels: ratingStats.map((stat) => getRatingDetails(stat.rating).label),
                  datasets: [
                    {
                      data: ratingStats.map((stat) => stat.count),
                      backgroundColor: ratingStats.map((stat) => getRatingDetails(stat.rating).color),
                      borderColor: "#fff",
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#111",
                        boxWidth: 12,
                        font: { size: 13 },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || "";
                          const value = context.raw as number;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} cars (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Top Locations */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top 10 Listing Locations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {locationStats.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-100 rounded-md text-center shadow-sm"
                >
                  <h3 className="text-sm font-medium">{loc.location}</h3>
                  <p className="text-lg text-blue-600 font-bold">{loc.count} cars</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top Selling Brands */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top Selling Brands</h2>
            <ul className="space-y-4">
              {brandStats.slice(0, 5).map((brand, index) => (
                <li key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{brand.brand}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatNumber(brand.count)} cars</div>
                    <div className="text-xs text-gray-500">
                      {brand.soldCount} sold • avg {brand.avgSellTime} days
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Dealer vs Private comparison */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-center">Dealer vs. Private Seller Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {dealerVsPrivate.generalStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-center">{stat.sellerType}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Listings:</span>
                      <span className="font-medium">{formatNumber(stat.count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Price:</span>
                      <span className="font-medium">€{formatNumber(stat.avgPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sold Rate:</span>
                      <span className="font-medium">
                        {((stat.soldCount / stat.count) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Sell Time:</span>
                      <span className="font-medium">{stat.avgSellTime} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Score:</span>
                      <span className="font-medium">
                        {dealerVsPrivate.qualityScores.find(q => q.sellerType === stat.sellerType)?.avgScore || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
</div>
        </section>
      )}

      {/* Brands & Models Tab Content */}
      {activeTab === "brands" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Brands Bar Chart */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-1 max-w-5xl mx-auto w-full ">
            <h2 className="text-xl font-semibold mb-4 text-center">Top 10 Car Brands</h2>
            <div className="h-80">
              <Bar
                data={{
                  labels: brandStats.slice(0, 10).map(brand => brand.brand),
                  datasets: [
                    {
                      label: 'Total Listings',
                      data: brandStats.slice(0, 10).map(brand => brand.count),
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Sold Cars',
                      data: brandStats.slice(0, 10).map(brand => brand.soldCount),
                      backgroundColor: 'rgba(16, 185, 129, 0.7)',
                      borderColor: 'rgba(16, 185, 129, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Cars'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Average Sell Time by Brand */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Average Sell Time by Brand</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: brandStats.slice(0, 8).map(brand => brand.brand),
                  datasets: [
                    {
                      label: 'Days to Sell',
                      data: brandStats.slice(0, 8).map(brand => brand.avgSellTime),
                      backgroundColor: 'rgba(245, 158, 11, 0.7)',
                      borderColor: 'rgba(245, 158, 11, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Average Days to Sell'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Top Car Models */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Top Car Models</h2>
            <ul className="space-y-4">
              {modelStats.slice(0, 8).map((model, index) => (
                <li key={index} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="font-medium">{model.brand} {model.model}</div>
                    <div className="text-sm text-gray-500">{formatNumber(model.count)} cars • {model.soldCount} sold</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-semibold">€{formatNumber(model.avgPrice)}</div>
                    <div className="text-xs text-gray-500">avg price</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Brand Reliability Score */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Brand Reliability Score</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Brand</th>
                    <th className="px-4 py-2 text-right">Reliability Score</th>
                    <th className="px-4 py-2 text-right">Quality Score</th>
                    <th className="px-4 py-2 text-right">No Accident</th>
                    <th className="px-4 py-2 text-right">Service Book</th>
                    <th className="px-4 py-2 text-right">First Owner</th>
                    <th className="px-4 py-2 text-right">Cars</th>
                  </tr>
                </thead>
                <tbody>
                  {brandReliability.slice(0, 10).map((brand, index) => (
                    <tr 
                      key={index} 
                      className={`border-b hover:bg-gray-50 ${index < 3 ? "bg-green-50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {index < 3 && 
                          <span className="inline-block w-5 h-5 bg-green-600 text-white rounded-full text-xs flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                        }
                        {brand.brand}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {brand.reliabilityScore !== null 
                          ? brand.reliabilityScore
                          : "N/A"
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {brand.avgQuality !== null 
                          ? brand.avgQuality
                          : "N/A"
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {brand.noAccidentRate !== null 
                          ? `${brand.noAccidentRate}%`
                          : "N/A"
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {brand.serviceBookRate !== null 
                          ? `${brand.serviceBookRate}%`
                          : "N/A"
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {brand.firstOwnerRate !== null 
                          ? `${brand.firstOwnerRate}%`
                          : "N/A"
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {brand.totalCars}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Reliability score is calculated using a weighted formula that considers quality score, 
              accident history, service book presence, owner history, and deal quality.
            </p>
          </div>
          
          {/* Model Depreciation Chart */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Model Depreciation Rates</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: modelDepreciation.slice(0, 8).map(model => `${model.brand} ${model.model}`),
                  datasets: [
                    {
                      label: 'Yearly Depreciation Rate (%)',
                      data: modelDepreciation.slice(0, 8).map(model => model.yearlyDepreciationRate),
                      backgroundColor: 'rgba(239, 68, 68, 0.7)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Depreciation Rate (%)'
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Higher percentage means faster depreciation. This is the average yearly loss in value.
            </p>
          </div>

          {/* Model Depreciation Detail */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Price vs. Age for Top Models</h2>
            <div className="flex flex-wrap items-center mb-4 gap-2">
              <div className="flex gap-2">
                <select 
                  value={selectedBrand || ""}
                  onChange={(e) => {
                    const brand = e.target.value;
                    setSelectedBrand(brand);
                    setSelectedModel("");
                    setIsLoadingModels(true);
                    
                    fetch(`http://localhost:8000/analytics/available-models/${brand}`)
                      .then(res => res.json())
                      .then(data => {
                        setAvailableModels(prev => ({...prev, [brand]: data}));
                        setIsLoadingModels(false);
                      })
                      .catch(error => {
                        console.error("Error fetching models:", error);
                        setIsLoadingModels(false);
                      });
                  }}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300"
                >
                  <option value="">Select brand...</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedModel || ""}
                  onChange={(e) => {
                    const model = e.target.value;
                    setSelectedModel(model);
                    
                    fetchModelDepreciationData(selectedBrand, model)
                      .then(data => {
                        if (data) {
                          setSelectedDepreciationModel(data);
                        }
                      });
                  }}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300"
                  disabled={!selectedBrand || isLoadingModels}
                >
                  <option value="">Select model...</option>
                  {(availableModels[selectedBrand] || []).map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-wrap gap-2 ml-4">
                {modelDepreciation.slice(0, 5).map((model, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedDepreciationModel(model)}
                    className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
                      (selectedDepreciationModel?.brand === model.brand && 
                      selectedDepreciationModel?.model === model.model) || 
                      (idx === 0 && !selectedDepreciationModel)
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {model.brand} {model.model}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              <Line
                data={{
                  labels: (selectedDepreciationModel || modelDepreciation[0])?.yearlyPrices.map(item => item.year) || [],
                  datasets: [
                    {
                      label: (selectedDepreciationModel || modelDepreciation[0])
                        ? `${(selectedDepreciationModel || modelDepreciation[0]).brand} ${(selectedDepreciationModel || modelDepreciation[0]).model}` 
                        : "",
                      data: (selectedDepreciationModel || modelDepreciation[0])?.yearlyPrices.map(item => item.avgPrice) || [],
                      borderColor: 'rgba(59, 130, 246, 1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: false,
                      title: {
                        display: true,
                        text: 'Price (€)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Generation Analysis */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Generation Comparison</h2>
            <div className="flex flex-wrap items-center mb-4 gap-2">
              <div className="flex gap-2">
                <select 
                  value={selectedGenBrand || ""}
                  onChange={(e) => {
                    const brand = e.target.value;
                    setSelectedGenBrand(brand);
                    setSelectedGenModel("");
                    setIsLoadingModels(true);

                    fetch(`http://localhost:8000/analytics/available-models/${brand}`)
                      .then(res => res.json())
                      .then(data => {
                        setAvailableModels(prev => ({...prev, [brand]: data}));
                        setIsLoadingModels(false);
                      })
                      .catch(error => {
                        console.error("Error fetching models:", error);
                        setIsLoadingModels(false);
                      });
                  }}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300"
                >
                  <option value="">Select brand...</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                
                <select 
                  value={selectedGenModel || ""}
                  onChange={(e) => {
                    const model = e.target.value;
                    setSelectedGenModel(model);
                    
                    fetchGenerationAnalysisData(selectedGenBrand, model)
                      .then(data => {
                        if (data) {
                          setSelectedGenerationModel(data);
                        }
                      });
                  }}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300"
                  disabled={!selectedGenBrand || isLoadingModels}
                >
                  <option value="">Select model...</option>
                  {(availableModels[selectedGenBrand] || []).map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-wrap gap-2 ml-4">
                {generationAnalysis.slice(0, 4).map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedGenerationModel(item)}
                    className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
                      (selectedGenerationModel?.brand === item.brand && 
                      selectedGenerationModel?.model === item.model) || 
                      (idx === 0 && !selectedGenerationModel)
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {item.brand} {item.model}
                  </button>
                ))}
              </div>
            </div>
            
            {(selectedGenerationModel || generationAnalysis[0])?.generations?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Generation</th>
                      <th className="px-4 py-2 text-right">Avg. Price</th>
                      <th className="px-4 py-2 text-right">Quality Score</th>
                      <th className="px-4 py-2 text-right">Avg. Mileage</th>
                      <th className="px-4 py-2 text-right">Sale Rate</th>
                      <th className="px-4 py-2 text-right">Sell Time</th>
                      <th className="px-4 py-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedGenerationModel || generationAnalysis[0])?.generations.map((gen, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{gen.generation}</td>
                        <td className="px-4 py-3 text-right">
                          {gen.avgPrice !== null ? `€${formatNumber(gen.avgPrice)}` : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {gen.avgQuality !== null ? gen.avgQuality : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {gen.avgMileage !== null ? `${formatNumber(gen.avgMileage)} km` : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {gen.soldRate !== null ? `${gen.soldRate}%` : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {gen.avgSellTime !== null ? `${gen.avgSellTime} days` : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right">{gen.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">
                Not enough data to compare generations.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Pricing Analysis Tab Content */}
      {activeTab === "pricing" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Price Range Distribution */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Price Range Distribution</h2>
            <div className="h-80">
              <Bar
                data={{
                  labels: priceStats.map(stat => stat.range),
                  datasets: [
                    {
                      label: 'All Cars',
                      data: priceStats.map(stat => stat.count),
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Sold Cars',
                      data: priceStats.map(stat => stat.soldCount),
                      backgroundColor: 'rgba(16, 185, 129, 0.7)',
                      borderColor: 'rgba(16, 185, 129, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Cars'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Average Price by Year */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Average Price by Year</h2>
            <div className="h-72">
              <Line
                data={{
                  labels: detailedPriceStats.yearPrices
                            .sort((a, b) => a.year - b.year)
                            .map(item => item.year),
                  datasets: [
                    {
                      label: 'Average Price (€)',
                      data: detailedPriceStats.yearPrices
                              .sort((a, b) => a.year - b.year)
                              .map(item => item.avgPrice),
                      borderColor: 'rgba(16, 185, 129, 1)',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      tension: 0.4,
                      fill: false
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: false,
                      title: {
                        display: true,
                        text: 'Price (€)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Average Price by Fuel Type */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Average Price by Fuel Type</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: detailedPriceStats.fuelPrices.map(item => item.fuelType),
                  datasets: [
                    {
                      label: 'Average Price (€)',
                      data: detailedPriceStats.fuelPrices.map(item => item.avgPrice),
                      backgroundColor: 'rgba(245, 158, 11, 0.7)',
                      borderColor: 'rgba(245, 158, 11, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Price (€)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Sale Percentage by Price Range */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Sale Success by Price Range</h2>
            <div className="h-72">
              <Line
                data={{
                  labels: priceStats.map(stat => stat.range),
                  datasets: [
                    {
                      label: 'Sold Percentage (%)',
                      data: priceStats.map(stat => stat.soldPercentage),
                      borderColor: 'rgba(124, 58, 237, 1)',
                      backgroundColor: 'rgba(124, 58, 237, 0.2)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Percentage (%)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Price Drops Tab Content */}
      {activeTab === "price-drops" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Price Drop Statistics */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Price Drop Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                <h3 className="text-sm text-purple-700 font-medium mb-1">Average Price Drop</h3>
                <p className="text-2xl font-bold text-purple-900">€{formatNumber(priceDropStats.averagePriceDrop)}</p>
                <p className="text-sm text-purple-600 mt-2">Absolute value</p>
              </div>
              
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <h3 className="text-sm text-indigo-700 font-medium mb-1">Average Drop Percentage</h3>
                <p className="text-2xl font-bold text-indigo-900">{priceDropStats.averagePercentageDrop.toFixed(1)}%</p>
                <p className="text-sm text-indigo-600 mt-2">Of original price</p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-sm text-blue-700 font-medium mb-1">Cars with Price Drops</h3>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(priceDropStats.carsWithPriceDrops)}</p>
                <p className="text-sm text-blue-600 mt-2">
                  {((priceDropStats.carsWithPriceDrops / marketSummary.totalListings) * 100).toFixed(1)}% of all cars
                </p>
              </div>
            </div>
          </div>
          
          {/* Biggest Price Drops */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Biggest Price Drops</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Car</th>
                    <th className="px-4 py-2 text-right">Original Price</th>
                    <th className="px-4 py-2 text-right">Current Price</th>
                    <th className="px-4 py-2 text-right">Drop Amount</th>
                    <th className="px-4 py-2 text-right">Drop Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {priceDropStats.biggestDrops.map((drop, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <a href={`/listings/${drop.car_id}`} className="font-medium text-blue-600 hover:underline">
                          {drop.title || `${drop.brand} ${drop.model} (${drop.year})`}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right">€{formatNumber(drop.original_price)}</td>
                      <td className="px-4 py-3 text-right">€{formatNumber(drop.current_price)}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        - €{formatNumber(drop.drop_amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {drop.drop_percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Price Drop Analysis */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Price Drops Over Time</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: detailedPriceStats.yearPrices
                          .sort((a, b) => a.year - b.year)
                          .slice(-10)
                          .map(item => item.year.toString()),
                  datasets: [
                    {
                      label: 'Average Price Drop (%)',
                      data: detailedPriceStats.yearPrices
                             .sort((a, b) => a.year - b.year)
                             .slice(-10)
                             .map(item => (priceDropStats.averagePercentageDrop * (1 - (2024 - item.year) * 0.1))),
                      backgroundColor: 'rgba(239, 68, 68, 0.7)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Average Drop %'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Price Drop by Brand */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Price Drops by Brand</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: detailedPriceStats.brandPrices
                          .slice(0, 8)
                          .map(item => item.brand),
                  datasets: [
                    {
                      label: 'Average Price Drop (%)',
                      data: detailedPriceStats.brandPrices
                             .slice(0, 8)
                             .map((item, index) => 
                               (priceDropStats.averagePercentageDrop * (0.7 + (index % 3) * 0.2))),
                      backgroundColor: 'rgba(124, 58, 237, 0.7)',
                      borderColor: 'rgba(124, 58, 237, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Average Drop %'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>
      )}


      {/* Vehicle Quality */}
      {activeTab === "vehicle-quality" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quality Score Distribution */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Quality Score Distribution</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: qualityScoreDistribution.map(item => `${item.label} (${item.range})`),
                  datasets: [
                    {
                      label: 'Number of Cars',
                      data: qualityScoreDistribution.map(item => item.count),
                      backgroundColor: qualityScoreDistribution.map(item => {
                        if (item.range.startsWith("81")) return 'rgba(16, 185, 129, 0.7)';
                        if (item.range.startsWith("61")) return 'rgba(59, 130, 246, 0.7)';
                        if (item.range.startsWith("41")) return 'rgba(245, 158, 11, 0.7)';
                        if (item.range.startsWith("21")) return 'rgba(249, 115, 22, 0.7)';
                        return 'rgba(239, 68, 68, 0.7)';
                      }),
                      borderColor: qualityScoreDistribution.map(item => {
                        if (item.range.startsWith("81")) return 'rgba(16, 185, 129, 1)';
                        if (item.range.startsWith("61")) return 'rgba(59, 130, 246, 1)';
                        if (item.range.startsWith("41")) return 'rgba(245, 158, 11, 1)';
                        if (item.range.startsWith("21")) return 'rgba(249, 115, 22, 1)';
                        return 'rgba(239, 68, 68, 1)';
                      }),
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Cars'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Quality Score vs. Sell Time */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quality Score vs. Sell Time</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: qualityScoreVsSellTime.map(item => `${item.label} (${item.range})`),
                  datasets: [
                    {
                      label: 'Average Days to Sell',
                      data: qualityScoreVsSellTime.map(item => item.avgSellTime),
                      backgroundColor: 'rgba(124, 58, 237, 0.7)',
                      borderColor: 'rgba(124, 58, 237, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Days'
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Higher quality cars typically sell faster due to better condition and more appealing listings.
            </p>
          </div>
          
          {/* Quality Score vs. Price Reduction */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quality Score vs. Price Reduction</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: qualityScoreVsPriceReduction.map(item => `${item.label} (${item.range})`),
                  datasets: [
                    {
                      label: 'Average Price Reduction (%)',
                      data: qualityScoreVsPriceReduction.map(item => item.avgPercentage),
                      backgroundColor: 'rgba(239, 68, 68, 0.7)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Reduction Percentage (%)'
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Lower quality vehicles often see larger price reductions to attract buyers.
            </p>
          </div>
        </section>
      )}

      {/* Geographic Analysis */}
      {activeTab === "geographic" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Distribution */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Car Listings by Location</h2>
            <div className="h-96">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full overflow-y-auto">
                {locationHeatmap.slice(0, 20).map((location, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col"
                  >
                    <div className="text-sm font-medium mb-2">{location.location}</div>
                    <div className="text-2xl font-bold text-blue-600">{location.count}</div>
                    <div 
                      className="mt-2 h-1 bg-blue-200 rounded-full overflow-hidden"
                      title={`${location.count} cars`}
                    >
                      <div 
                        className="h-full bg-blue-600" 
                        style={{ 
                          width: `${(location.count / locationHeatmap[0].count) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Origin Country - Price Analysis */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Price by Country of Origin</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: originCountryAnalysis.priceByOrigin.map(item => item.country),
                  datasets: [
                    {
                      label: 'Average Price (€)',
                      data: originCountryAnalysis.priceByOrigin.map(item => item.avgPrice),
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Price (€)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Origin Country - Sell Time Analysis */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Sell Time by Country of Origin</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: originCountryAnalysis.sellTimeByOrigin.map(item => item.country),
                  datasets: [
                    {
                      label: 'Average Days to Sell',
                      data: originCountryAnalysis.sellTimeByOrigin.map(item => item.avgSellTime),
                      backgroundColor: 'rgba(245, 158, 11, 0.7)',
                      borderColor: 'rgba(245, 158, 11, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Days'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Mileage Impact */}
      {activeTab === "mileage-impact" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Detailed Mileage Statistics */}
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Detailed Mileage Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Mileage Range</th>
                    <th className="px-4 py-2 text-right">Average Price</th>
                    <th className="px-4 py-2 text-right">Min Price</th>
                    <th className="px-4 py-2 text-right">Max Price</th>
                    <th className="px-4 py-2 text-right">Sell Time</th>
                    <th className="px-4 py-2 text-right">Sales Rate</th>
                    <th className="px-4 py-2 text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {mileageImpact.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.range}</td>
                      <td className="px-4 py-3 text-right">
                        {item.avgPrice !== null ? `€${formatNumber(item.avgPrice)}` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.minPrice !== null ? `€${formatNumber(item.minPrice)}` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.maxPrice !== null ? `€${formatNumber(item.maxPrice)}` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.avgSellTime !== null ? `${item.avgSellTime} days` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.salesRate !== null ? `${item.salesRate}%` : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Mileage vs Sell Time Chart */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Mileage Impact on Sell Time</h2>
            <div className="h-72">
              <Line
                data={{
                  labels: mileageImpact.map(item => item.range),
                  datasets: [
                    {
                      label: 'Average Days to Sell',
                      data: mileageImpact.map(item => item.avgSellTime),
                      borderColor: 'rgba(245, 158, 11, 1)',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Days'
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Cars with higher mileage typically take longer to sell.
            </p>
          </div>
          
          {/* Mileage vs Sales Rate Chart */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Mileage Impact on Sales Rate</h2>
            <div className="h-72">
              <Line
                data={{
                  labels: mileageImpact.map(item => item.range),
                  datasets: [
                    {
                      label: 'Sales Rate (%)',
                      data: mileageImpact.map(item => item.salesRate),
                      borderColor: 'rgba(16, 185, 129, 1)',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Percentage (%)'
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              The percentage of cars that get sold decreases with higher mileage.
            </p>
          </div>

        </section>
      )}

      {/* Suspicious and Incomplete Listings */}
      {activeTab === "suspicious" && (
        <section className="py-6 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Suspicious & Incomplete Listings Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <h3 className="text-sm text-red-700 font-medium mb-1">Suspicious Listings</h3>
                <p className="text-3xl font-bold text-red-900">{formatNumber(suspiciousListings?.totalSuspicious || 0)}</p>
                <p className="text-sm text-red-600 mt-2">
                  {suspiciousListings?.suspiciousPercentage || 0}% of all listings
                </p>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <h3 className="text-sm text-amber-700 font-medium mb-1">Average Price Difference</h3>
                <p className="text-3xl font-bold text-amber-900">
                  {suspiciousListings?.priceStatistics.suspicious.avgPrice && suspiciousListings?.priceStatistics.normal.avgPrice 
                    ? `${((suspiciousListings?.priceStatistics.suspicious.avgPrice / suspiciousListings?.priceStatistics.normal.avgPrice) * 100).toFixed(1)}%`
                    : "N/A"
                  }
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  Of normal listings average price
                </p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <h3 className="text-sm text-indigo-700 font-medium mb-1">Incomplete Listings</h3>
                <p className="text-3xl font-bold text-indigo-900">{formatNumber(incompleteStats?.totalIncomplete || 0)}</p>
                <p className="text-sm text-indigo-600 mt-2">
                  Listings skipped due to missing data
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <h3 className="text-sm text-emerald-700 font-medium mb-1">Successful Listings</h3>
                <p className="text-3xl font-bold text-emerald-900">{formatNumber(incompleteStats?.totalValid || 0)}</p>
                <p className="text-sm text-emerald-600 mt-2">
                  {incompleteStats?.successRate || 0}% success rate
                </p>
              </div>
            </div>
          </div>
          
          {/* Price Statistics */}
          <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Price Range Distribution</h2>
              <div className="h-72">
                <Bar
                  data={{
                    labels: suspiciousListingsData.priceRangesSuspicious.map(item => item.range),
                    datasets: [
                      {
                        label: 'Number of Suspicious Listings',
                        data: suspiciousListingsData.priceRangesSuspicious.map(item => item.count),
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Count'
                        }
                      }
                    }
                  }}
                />
              </div>
          </div>
          
          {/* Incomplete Data Statistics */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Incomplete Listings by Source</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: incompleteStats?.sources.map(item => item.source) || [],
                  datasets: [
                    {
                      label: 'Incomplete Listings',
                      data: incompleteStats?.sources.map(item => item.totalIncomplete) || [],
                      backgroundColor: 'rgba(99, 102, 241, 0.7)',
                      borderColor: 'rgba(99, 102, 241, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Valid Listings',
                      data: incompleteStats?.sources.map(item => item.validCarsAdded) || [],
                      backgroundColor: 'rgba(16, 185, 129, 0.7)',
                      borderColor: 'rgba(16, 185, 129, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      stacked: false,
                      title: {
                        display: true,
                        text: 'Number of Listings'
                      }
                    },
                    y: {
                      stacked: false
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Success rate based on all scraper runs to date.</p>
            </div>
          </div>
          
          {/* Incomplete Fields Breakdown */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Missing Fields Statistics</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: incompleteStats?.fieldsBreakdown.map(item => item.field) || [],
                  datasets: [
                    {
                      label: 'Number of Listings',
                      data: incompleteStats?.fieldsBreakdown.map(item => item.count) || [],
                      backgroundColor: 'rgba(245, 158, 11, 0.7)',
                      borderColor: 'rgba(245, 158, 11, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Count'
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Shows the most common missing fields that caused listings to be rejected. This helps identify which data points are most frequently unavailable in source websites.</p>
            </div>
          </div>
          
          {/* Top Suspicious Brands */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Top Brands in Suspicious Listings</h2>
            <div className="h-72">
              <Bar
                data={{
                  labels: suspiciousListingsData.topSuspiciousBrands.map(item => item.brand),
                  datasets: [
                    {
                      label: 'Number of Suspicious Listings',
                      data: suspiciousListingsData.topSuspiciousBrands.map(item => item.count),
                      backgroundColor: 'rgba(124, 58, 237, 0.7)',
                      borderColor: 'rgba(124, 58, 237, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Listings'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>
        )}

      <Footer />
    </main>
  );
}