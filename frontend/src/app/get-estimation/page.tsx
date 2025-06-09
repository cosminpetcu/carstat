"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CarCard, type CarData } from "@/components/ui/CarCard";
import { useBrandsModels } from '@/hooks/useBrandsModels';

type EstimationCarData = {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    fuel_type: string;
    transmission: string;
    engine_capacity: number;
    drive_type?: string;
    generation?: string;
    right_hand_drive?: boolean;
};

type EstimationResult = {
    estimated_price: number;
    confidence_level: string;
    similar_cars_count: number;
    price_range: {
        min: number;
        max: number;
        avg: number;
    };
    market_position: string;
    market_comparison: {
        total_similar_cars: number;
        price_variance: number;
        cheapest_similar: number;
        most_expensive_similar: number;
        your_estimated_rank: string;
        savings_vs_highest: number;
        premium_vs_lowest: number;
    };
    price_distribution: Array<{
        range: string;
        count: number;
        percentage: number;
    }>;
    similar_cars_sample: Array<{
        id: number;
        title: string;
        year: number;
        mileage: number;
        price: number;
        fuel_type: string;
        transmission: string;
        engine_capacity: number;
        location: string;
        images?: string;
        deal_rating?: string;
        estimated_price?: number;
        sold?: boolean;
    }>;
};

type ModelSpecs = {
    fuel_types: string[];
    transmissions: string[];
    drive_types: string[];
    engine_capacities: number[];
    year_range: { min: number; max: number };
    typical_mileage: { min: number; max: number; avg: number };
};

type EstimationHistory = {
    id: number;
    car_data: EstimationCarData;
    estimation_result: EstimationResult;
    notes?: string;
    created_at: string;
};

export default function CleanEstimationPage() {
    const [carData, setCarData] = useState<EstimationCarData>({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        mileage: 0,
        fuel_type: "",
        transmission: "",
        engine_capacity: 0,
    });
    const { brands, models, isLoadingBrands, isLoadingModels, fetchModels } = useBrandsModels();
    const [modelSpecs, setModelSpecs] = useState<ModelSpecs | null>(null);
    const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"estimate" | "history">("estimate");
    const [estimationHistory, setEstimationHistory] = useState<EstimationHistory[]>([]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<EstimationHistory | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ id: number; email: string; full_name: string } | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");

        setIsLoggedIn(!!token);
        if (token && userRaw) {
            try {
                setUser(JSON.parse(userRaw));
            } catch (e) {
                console.error("Invalid user data");
                setUser(null);
                setIsLoggedIn(false);
            }
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn && user) {
            loadEstimationHistory();
        } else {
            loadLocalHistory();
        }
    }, [isLoggedIn, user]);

    const loadEstimationHistory = async () => {
        if (!isLoggedIn) return;

        setHistoryLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/estimation-history/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setEstimationHistory(data);
            } else {
                console.error("Failed to load estimation history");
                loadLocalHistory();
            }
        } catch (error) {
            console.error("Error loading estimation history:", error);
            loadLocalHistory();
        } finally {
            setHistoryLoading(false);
        }
    };

    const loadLocalHistory = () => {
        let historyKey = "estimation_history";

        if (user) {
            historyKey = `estimation_history_user_${user.id}`;
        }

        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                const transformedHistory = parsed.map((item: any) => ({
                    id: parseInt(item.id),
                    car_data: item.car,
                    estimation_result: item.result,
                    notes: item.notes,
                    created_at: item.timestamp
                }));
                setEstimationHistory(transformedHistory);
            } catch (e) {
                console.error("Failed to load local estimation history:", e);
            }
        }
    };

    const saveToHistory = async (car: EstimationCarData, result: EstimationResult, notes?: string) => {
        if (isLoggedIn && user) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8000/estimation-history/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        car_data: car,
                        estimation_result: result,
                        notes: notes
                    }),
                });

                if (response.ok) {
                    loadEstimationHistory();
                    return;
                } else {
                    console.error("Failed to save to backend, falling back to localStorage");
                }
            } catch (error) {
                console.error("Error saving to backend:", error);
            }
        }

        const newItem = {
            id: Date.now(),
            car_data: { ...car },
            estimation_result: { ...result },
            notes,
            created_at: new Date().toISOString()
        };

        const updatedHistory = [newItem, ...estimationHistory].slice(0, 20);
        setEstimationHistory(updatedHistory);

        let historyKey = "estimation_history";
        if (user) {
            historyKey = `estimation_history_user_${user.id}`;
        }

        localStorage.setItem(historyKey, JSON.stringify(updatedHistory.map(item => ({
            id: item.id.toString(),
            car: item.car_data,
            result: item.estimation_result,
            notes: item.notes,
            timestamp: item.created_at
        }))));
    };

    const clearUserHistory = async () => {
        if (isLoggedIn && user) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8000/estimation-history/", {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setEstimationHistory([]);
                    return;
                }
            } catch (error) {
                console.error("Error clearing backend history:", error);
            }
        }

        let historyKey = "estimation_history";
        if (user) {
            historyKey = `estimation_history_user_${user.id}`;
        }

        setEstimationHistory([]);
        localStorage.removeItem(historyKey);
    };

    const deleteHistoryItem = async (itemId: number) => {
        if (isLoggedIn && user) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/estimation-history/${itemId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    loadEstimationHistory();
                    return;
                }
            } catch (error) {
                console.error("Error deleting from backend:", error);
            }
        }

        const updatedHistory = estimationHistory.filter(item => item.id !== itemId);
        setEstimationHistory(updatedHistory);

        let historyKey = "estimation_history";
        if (user) {
            historyKey = `estimation_history_user_${user.id}`;
        }

        localStorage.setItem(historyKey, JSON.stringify(updatedHistory.map(item => ({
            id: item.id.toString(),
            car: item.car_data,
            result: item.estimation_result,
            notes: item.notes,
            timestamp: item.created_at
        }))));
    };

    const updateHistoryNotes = async (itemId: number, notes: string) => {
        if (isLoggedIn && user) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:8000/estimation-history/${itemId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ notes }),
                });

                if (response.ok) {
                    loadEstimationHistory();
                    return;
                }
            } catch (error) {
                console.error("Error updating notes in backend:", error);
            }
        }

        const updatedHistory = estimationHistory.map(item =>
            item.id === itemId ? { ...item, notes } : item
        );
        setEstimationHistory(updatedHistory);

        let historyKey = "estimation_history";
        if (user) {
            historyKey = `estimation_history_user_${user.id}`;
        }

        localStorage.setItem(historyKey, JSON.stringify(updatedHistory.map(item => ({
            id: item.id.toString(),
            car: item.car_data,
            result: item.estimation_result,
            notes: item.notes,
            timestamp: item.created_at
        }))));
    };

    const loadHistoryParameters = async (historyCarData: EstimationCarData) => {
        try {
            setCarData(prev => ({ ...prev, brand: historyCarData.brand }));

            await fetchModels(historyCarData.brand);

            setCarData(historyCarData);
            setEstimationResult(null);
            setSelectedHistoryItem(null);
        } catch (error) {
            console.error("Error loading history parameters:", error);
            setCarData(historyCarData);
            setEstimationResult(null);
            setSelectedHistoryItem(null);
        }
    };

    useEffect(() => {
        if (carData.brand) {
            fetchModels(carData.brand);
            setCarData(prev => ({ ...prev, model: "" }));
        }
    }, [carData.brand, fetchModels]);

    useEffect(() => {
        if (carData.brand && carData.model) {
            fetch(`http://localhost:8000/estimation/specs/${carData.brand}/${carData.model}`)
                .then((res) => res.json())
                .then((data) => {
                    setModelSpecs(data);
                    setCarData(prev => ({
                        ...prev,
                        fuel_type: data.fuel_types.length === 1 ? data.fuel_types[0] : prev.fuel_type,
                        transmission: data.transmissions.length === 1 ? data.transmissions[0] : prev.transmission,
                        drive_type: data.drive_types.length === 1 ? data.drive_types[0] : prev.drive_type,
                        engine_capacity: data.engine_capacities.length === 1 ? data.engine_capacities[0] : (prev.engine_capacity || 0),
                    }));
                })
                .catch((err) => console.error("Error fetching specs:", err));
        }
    }, [carData.brand, carData.model]);

    const handleInputChange = (field: keyof EstimationCarData, value: any) => {
        setCarData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setEstimationResult(null);

        try {
            const headers: any = {
                "Content-Type": "application/json",
            };

            if (isLoggedIn) {
                const token = localStorage.getItem("token");
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }

            const response = await fetch("http://localhost:8000/estimation/estimate-price", {
                method: "POST",
                headers,
                body: JSON.stringify(carData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to get estimation");
            }

            const result = await response.json();
            setEstimationResult(result);

            if (!isLoggedIn) {
                saveToHistory(carData, result);
            } else {
                setTimeout(loadEstimationHistory, 10000);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectHistoryItem = (item: EstimationHistory) => {
        setSelectedHistoryItem(item);
        setEstimationResult(item.estimation_result);
        setActiveTab("estimate");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        };
    };

    const isFormValid = carData.brand && carData.model && carData.year && carData.mileage >= 0 &&
        carData.fuel_type && carData.transmission && carData.engine_capacity > 0;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-700">
            <Navbar />

            <div className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Car Price Estimation
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Get accurate market price estimation based on thousands of similar listings from across Romania.
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-xl p-2 shadow-lg">
                            <nav className="flex space-x-2">
                                {[
                                    { id: "estimate", label: "New Estimation" },
                                    {
                                        id: "history",
                                        label: "History",
                                        badge: estimationHistory.length > 0 ? estimationHistory.length : undefined
                                    }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors relative ${activeTab === tab.id
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            }`}
                                    >
                                        {tab.label}
                                        {tab.badge && (
                                            <span className={`ml-2 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center ${activeTab === tab.id
                                                ? "bg-white text-blue-600"
                                                : "text-white bg-blue-600"}`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Estimate Tab */}
                    {activeTab === "estimate" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Form Section */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-lg p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Car Details</h2>

                                    <form onSubmit={handleSubmit} className="space-y-6">

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Brand *
                                                </label>
                                                <select
                                                    value={carData.brand}
                                                    onChange={(e) => {
                                                        const newBrand = e.target.value;
                                                        setCarData(prev => ({
                                                            ...prev,
                                                            brand: newBrand,
                                                            model: ""
                                                        }));
                                                    }}
                                                    className={`block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:border-blue-500 ${isLoadingBrands ? 'opacity-50' : ''}`}
                                                    disabled={isLoadingBrands}
                                                    required
                                                >
                                                    <option value="">Select Brand</option>
                                                    {isLoadingBrands ? (
                                                        <option value="" disabled>Loading brands...</option>
                                                    ) : (
                                                        brands.map((brand) => (
                                                            <option key={brand} value={brand}>{brand}</option>
                                                        ))
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Model *
                                                </label>
                                                <select
                                                    value={carData.model}
                                                    onChange={(e) => setCarData(prev => ({ ...prev, model: e.target.value }))}
                                                    className={`block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:border-blue-500 ${isLoadingModels || !carData.brand ? 'opacity-50' : ''}`}
                                                    disabled={isLoadingModels || !carData.brand}
                                                    required
                                                >
                                                    <option value="">Select Model</option>
                                                    {isLoadingModels ? (
                                                        <option value="" disabled>Loading models...</option>
                                                    ) : (
                                                        models.map((model) => (
                                                            <option key={model} value={model}>{model}</option>
                                                        ))
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Year *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={carData.year || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        handleInputChange("year", value ? parseInt(value) : new Date().getFullYear());
                                                    }}
                                                    min={modelSpecs?.year_range.min || 1990}
                                                    max={modelSpecs?.year_range.max || new Date().getFullYear()}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                                {modelSpecs && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Available: {modelSpecs.year_range.min} - {modelSpecs.year_range.max}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Mileage (km) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={carData.mileage || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        handleInputChange("mileage", value ? parseInt(value) : 0);
                                                    }}
                                                    min={0}
                                                    max={500000}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                                {modelSpecs?.typical_mileage.avg && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Average for this model: {modelSpecs.typical_mileage.avg.toLocaleString()} km
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fuel Type *
                                                </label>
                                                <select
                                                    value={carData.fuel_type}
                                                    onChange={(e) => handleInputChange("fuel_type", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Fuel Type</option>
                                                    {modelSpecs?.fuel_types.map((fuel) => (
                                                        <option key={fuel} value={fuel}>
                                                            {fuel}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Transmission *
                                                </label>
                                                <select
                                                    value={carData.transmission}
                                                    onChange={(e) => handleInputChange("transmission", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Transmission</option>
                                                    {modelSpecs?.transmissions.map((trans) => (
                                                        <option key={trans} value={trans}>
                                                            {trans}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Engine Capacity (cc) *
                                                </label>
                                                <select
                                                    value={carData.engine_capacity || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        handleInputChange("engine_capacity", value ? parseInt(value) : 0);
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Engine Capacity</option>
                                                    {modelSpecs?.engine_capacities.map((capacity) => (
                                                        <option key={capacity} value={capacity}>
                                                            {capacity} cc
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Drive Type
                                                </label>
                                                <select
                                                    value={carData.drive_type || ""}
                                                    onChange={(e) => handleInputChange("drive_type", e.target.value || undefined)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Select Drive Type</option>
                                                    {modelSpecs?.drive_types.map((drive) => (
                                                        <option key={drive} value={drive}>
                                                            {drive}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Right Hand Drive
                                            </label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="right_hand_drive"
                                                        value="false"
                                                        checked={carData.right_hand_drive === false}
                                                        onChange={() => handleInputChange("right_hand_drive", false)}
                                                        className="mr-2"
                                                    />
                                                    No (Left Hand Drive)
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="right_hand_drive"
                                                        value="true"
                                                        checked={carData.right_hand_drive === true}
                                                        onChange={() => handleInputChange("right_hand_drive", true)}
                                                        className="mr-2"
                                                    />
                                                    Yes (Right Hand Drive)
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!isFormValid || loading}
                                            className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                                    Calculating...
                                                </div>
                                            ) : (
                                                "Get Price Estimation"
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-2xl p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-blue-900 ml-3">How it works</h3>
                                    </div>
                                    <ul className="space-y-3 text-blue-800">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            We analyze thousands of similar car listings
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Compare your car's specs with market data
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Provide accurate price estimation and insights
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            {isLoggedIn ? "Save estimation history to your account" : "Save estimation history locally"}
                                        </li>
                                    </ul>
                                </div>

                                {!isLoggedIn && (
                                    <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                                        <h3 className="text-lg font-semibold text-yellow-900 mb-3">Sign in for more features</h3>
                                        <p className="text-yellow-800 text-sm mb-4">
                                            Create an account to save your estimation history permanently and access it from any device.
                                        </p>
                                        <a
                                            href="/login"
                                            className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                                        >
                                            Sign In / Register
                                        </a>
                                    </div>
                                )}

                                <div className="bg-green-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-green-900 mb-3">Free & Accurate</h3>
                                    <p className="text-green-800 text-sm">
                                        Our estimation algorithm uses real market data from OLX and Autovit,
                                        updated daily to give you the most accurate pricing information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === "history" && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Estimation History</h2>
                                    {estimationHistory.length > 0 && (
                                        <button
                                            onClick={clearUserHistory}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {historyLoading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading estimation history...</p>
                                    </div>
                                ) : estimationHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No estimation history yet</h3>
                                        <p className="text-gray-600 mb-4">Create your first estimation to start building your history.</p>
                                        <button
                                            onClick={() => setActiveTab("estimate")}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Create Estimation
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {estimationHistory.map((item) => {
                                            const dateTime = formatDate(item.created_at);
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-lg text-gray-900">
                                                                {item.car_data.brand} {item.car_data.model} ({item.car_data.year})
                                                            </h3>
                                                            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                                                                <span>{item.car_data.mileage.toLocaleString()} km</span>
                                                                <span>{item.car_data.fuel_type}</span>
                                                                <span>{item.car_data.transmission}</span>
                                                                <span>{item.car_data.engine_capacity} cc</span>
                                                            </div>
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                {dateTime.date} at {dateTime.time}
                                                            </div>
                                                            {item.notes && (
                                                                <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                                    <strong>Notes:</strong> {item.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right ml-6">
                                                            <div className="text-2xl font-bold text-blue-600">
                                                                €{item.estimation_result.estimated_price.toLocaleString()}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {item.estimation_result.confidence_level} confidence
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {item.estimation_result.market_position}
                                                            </div>
                                                            <div className="mt-3 space-x-2">
                                                                <button
                                                                    onClick={() => selectHistoryItem(item)}
                                                                    className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                                                                >
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const notes = prompt("Add/edit notes for this estimation:", item.notes || "");
                                                                        if (notes !== null) {
                                                                            updateHistoryNotes(item.id, notes);
                                                                        }
                                                                    }}
                                                                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                                                >
                                                                    {item.notes ? "Edit Notes" : "Add Notes"}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm("Are you sure you want to delete this estimation?")) {
                                                                            deleteHistoryItem(item.id);
                                                                        }
                                                                    }}
                                                                    className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selected History Item Details */}
                    {selectedHistoryItem && activeTab === "estimate" && (
                        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Selected Estimation: {selectedHistoryItem.car_data.brand} {selectedHistoryItem.car_data.model} ({selectedHistoryItem.car_data.year})
                                </h2>
                                <button
                                    onClick={() => setSelectedHistoryItem(null)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Car Details from History */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-xl">
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">Brand & Model</div>
                                    <div className="font-semibold text-lg">{selectedHistoryItem.car_data.brand} {selectedHistoryItem.car_data.model}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">Year</div>
                                    <div className="font-semibold text-lg">{selectedHistoryItem.car_data.year}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">Mileage</div>
                                    <div className="font-semibold text-lg">{selectedHistoryItem.car_data.mileage.toLocaleString()} km</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">Fuel Type</div>
                                    <div className="font-semibold text-lg">{selectedHistoryItem.car_data.fuel_type}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">Transmission</div>
                                    <div className="font-semibold text-lg">{selectedHistoryItem.car_data.transmission}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">Engine Capacity</div>
                                    <div className="font-semibold text-lg">{selectedHistoryItem.car_data.engine_capacity} cc</div>
                                </div>
                                {selectedHistoryItem.car_data.drive_type && (
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600">Drive Type</div>
                                        <div className="font-semibold text-lg">{selectedHistoryItem.car_data.drive_type}</div>
                                    </div>
                                )}
                                {selectedHistoryItem.car_data.generation && (
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600">Generation</div>
                                        <div className="font-semibold text-lg">{selectedHistoryItem.car_data.generation}</div>
                                    </div>
                                )}
                                {selectedHistoryItem.car_data.right_hand_drive !== undefined && (
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600">Right Hand Drive</div>
                                        <div className="font-semibold text-lg">{selectedHistoryItem.car_data.right_hand_drive ? "Yes" : "No"}</div>
                                    </div>
                                )}
                            </div>

                            {/* Compare with Current Form */}
                            {(carData.brand !== selectedHistoryItem.car_data.brand ||
                                carData.model !== selectedHistoryItem.car_data.model ||
                                carData.year !== selectedHistoryItem.car_data.year) && (
                                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Current Form vs Selected History</h4>
                                        <div className="text-sm text-yellow-700">
                                            The car details above are from your saved estimation. Your current form has different parameters.
                                            Use the button below to copy these parameters to your current form.
                                        </div>
                                    </div>
                                )}

                            {/* Estimation Date */}
                            <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-600">Estimation Date</div>
                                <div className="font-semibold text-blue-800">
                                    {formatDate(selectedHistoryItem.created_at).date} at {formatDate(selectedHistoryItem.created_at).time}
                                </div>
                                {selectedHistoryItem.notes && (
                                    <div className="mt-2 text-sm text-blue-700">
                                        <strong>Notes:</strong> {selectedHistoryItem.notes}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center space-x-4 mb-8">
                                <button
                                    onClick={() => loadHistoryParameters(selectedHistoryItem.car_data)}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Use These Parameters for New Estimation
                                </button>
                                <button
                                    onClick={() => {
                                        const notes = prompt("Edit notes for this estimation:", selectedHistoryItem.notes || "");
                                        if (notes !== null) {
                                            updateHistoryNotes(selectedHistoryItem.id, notes);
                                            setSelectedHistoryItem({ ...selectedHistoryItem, notes });
                                        }
                                    }}
                                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Edit Notes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-800 font-medium">Error: {error}</p>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    {activeTab === "estimate" && estimationResult && (
                        <div className="mt-12 space-y-8">

                            {/* Main Price Result */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
                                <h2 className="text-3xl font-bold mb-4">Estimated Market Price</h2>
                                <div className="text-6xl font-bold mb-4">
                                    €{estimationResult.estimated_price.toLocaleString()}
                                </div>
                                <div className="flex justify-center items-center space-x-6 text-blue-100">
                                    <div className="text-center">
                                        <div className="text-sm">Confidence</div>
                                        <div className="font-semibold">{estimationResult.confidence_level}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm">Market Position</div>
                                        <div className="font-semibold">{estimationResult.market_position}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm">Similar Cars</div>
                                        <div className="font-semibold">{estimationResult.similar_cars_count}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Market Analysis and Insights */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Market Analysis */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Market Analysis</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Price Range</span>
                                            <span className="font-semibold">
                                                €{estimationResult.price_range.min.toLocaleString()} - €{estimationResult.price_range.max.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Average Price</span>
                                            <span className="font-semibold">€{estimationResult.price_range.avg.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Your Rank</span>
                                            <span className="font-semibold">{estimationResult.market_comparison.your_estimated_rank}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">vs. Most Expensive</span>
                                            <span className="font-semibold text-green-600">
                                                -€{estimationResult.market_comparison.savings_vs_highest.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Distribution */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Price Distribution</h3>
                                    <div className="space-y-3">
                                        {estimationResult.price_distribution.map((range, index) => (
                                            <div key={index} className="flex items-center">
                                                <div className="w-32 text-sm text-gray-600 mr-3">{range.range}</div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                                                    <div
                                                        className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                                                        style={{ width: `${range.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-12 text-sm font-medium">{range.percentage}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Market Insights */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Market Insights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Price Position */}
                                    <div className="p-6 rounded-xl border-l-4 bg-blue-50 border-blue-500">
                                        <div className="flex items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Price Position</h4>
                                                <p className="text-gray-700 text-sm">
                                                    Your car is positioned at the {estimationResult.market_comparison.your_estimated_rank} of the market.
                                                    {estimationResult.market_position === "Below Average" && " This represents good value for buyers."}
                                                    {estimationResult.market_position === "Above Average" && " This is in the premium segment."}
                                                    {estimationResult.market_position === "Average" && " This is competitive with market standards."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confidence Level */}
                                    <div className={`p-6 rounded-xl border-l-4 ${estimationResult.confidence_level === "High" ? "bg-green-50 border-green-500" :
                                        estimationResult.confidence_level === "Medium" ? "bg-yellow-50 border-yellow-500" :
                                            "bg-red-50 border-red-500"
                                        }`}>
                                        <div className="flex items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Estimation Accuracy</h4>
                                                <p className="text-gray-700 text-sm">
                                                    {estimationResult.confidence_level} confidence based on {estimationResult.similar_cars_count} similar cars.
                                                    {estimationResult.confidence_level === "High" && " This estimate is highly reliable."}
                                                    {estimationResult.confidence_level === "Medium" && " This estimate has moderate reliability."}
                                                    {estimationResult.confidence_level === "Low" && " Consider getting additional appraisals."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mileage Analysis */}
                                    <div className="p-6 rounded-xl border-l-4 bg-gray-50 border-gray-500">
                                        <div className="flex items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Mileage Impact</h4>
                                                <p className="text-gray-700 text-sm">
                                                    {(() => {
                                                        const avgMileageForYear = (new Date().getFullYear() - carData.year) * 15000;
                                                        if (carData.mileage < avgMileageForYear * 0.7) {
                                                            return `Low mileage for age - this increases value. Average would be ${Math.round(avgMileageForYear / 1000)}k km.`;
                                                        } else if (carData.mileage > avgMileageForYear * 1.3) {
                                                            return `Higher than average mileage for age. This may affect resale value.`;
                                                        } else {
                                                            return `Mileage is within normal range for a ${new Date().getFullYear() - carData.year} year old car.`;
                                                        }
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selling Strategy */}
                                    <div className="p-6 rounded-xl border-l-4 bg-purple-50 border-purple-500">
                                        <div className="flex items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Selling Strategy</h4>
                                                <p className="text-gray-700 text-sm">
                                                    Consider pricing between €{Math.round(estimationResult.estimated_price * 0.95).toLocaleString()} - €{Math.round(estimationResult.estimated_price * 1.05).toLocaleString()} for optimal market positioning.
                                                    Start higher and adjust based on market response.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Similar Cars */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Similar Cars Found</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {estimationResult.similar_cars_sample.map((car) => (
                                        <CarCard
                                            key={car.id}
                                            car={(car as CarData)}
                                            variant="compact"
                                            showImageNavigation={true}
                                            showQualityScore={false}
                                            showEstimatedPrice={true}
                                            className="border border-gray-100"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Additional Market Information */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                    {/* Depreciation Analysis */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4">Depreciation Analysis</h4>
                                        <div className="space-y-3">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Current Age</span>
                                                    <span className="font-semibold">{new Date().getFullYear() - carData.year} years</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Typical Annual Depreciation</span>
                                                    <span className="font-semibold text-red-600">12-15%</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Estimated Value Next Year</span>
                                                    <span className="font-semibold">€{Math.round(estimationResult.estimated_price * 0.87).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Factors */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4">Key Value Factors</h4>
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    factor: "Mileage",
                                                    status: carData.mileage < (new Date().getFullYear() - carData.year) * 12000 ? "positive" : "neutral",
                                                    impact: carData.mileage < (new Date().getFullYear() - carData.year) * 12000 ? "Positive" : "Standard"
                                                },
                                                {
                                                    factor: "Fuel Type",
                                                    status: carData.fuel_type === "Electric" || carData.fuel_type === "Hybrid" ? "positive" : "neutral",
                                                    impact: carData.fuel_type === "Electric" || carData.fuel_type === "Hybrid" ? "Premium" : "Standard"
                                                },
                                                {
                                                    factor: "Transmission",
                                                    status: carData.transmission === "Automatic" ? "positive" : "neutral",
                                                    impact: carData.transmission === "Automatic" ? "Premium" : "Standard"
                                                }
                                            ].map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-600">{item.factor}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`w-2 h-2 rounded-full ${item.status === "positive" ? "bg-green-500" : "bg-gray-400"
                                                            }`}></span>
                                                        <span className="font-semibold text-sm">{item.impact}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-2xl p-8 text-white text-center">
                                <h3 className="text-2xl font-bold mb-4">Ready to Take Action?</h3>
                                <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                                    Now that you have your market valuation, explore your options and make informed decisions.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="/listings"
                                        className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
                                    >
                                        Browse Similar Cars
                                    </a>
                                    <a
                                        href="/detailed-search"
                                        className="bg-green-600 bg-opacity-50 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-lg font-medium hover:bg-opacity-70 transition-all"
                                    >
                                        Advanced Search
                                    </a>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Next Steps</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Save This Estimation</h4>
                                        <p className="text-gray-600 text-sm">
                                            Your estimation has been automatically saved to your history for future reference.
                                        </p>
                                    </div>

                                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Find Similar Cars</h4>
                                        <p className="text-gray-600 text-sm">
                                            Browse our listings to find cars similar to yours or discover better deals in the market.
                                        </p>
                                    </div>

                                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Track Market Trends</h4>
                                        <p className="text-gray-600 text-sm">
                                            Return periodically to track how your car's value changes with market conditions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div >
    )
};