"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { CarCard, type CarData } from "@/components/ui/CarCard";
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/ToastContainer';

type SavedSearch = {
  id: number;
  query: string;
};

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl shadow-md animate-pulse flex flex-col h-full">
    <div className="bg-gray-200 h-[180px] w-full rounded-lg mb-4"></div>
    <div className="space-y-2 flex-grow">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-5 bg-gray-200 rounded w-1/3 mt-2"></div>
    </div>
  </div>
);

export default function FavoritesPage() {
  const router = useRouter();
  const [cars, setCars] = useState<CarData[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState<{ [carId: number]: number }>({});
  const [activeTab, setActiveTab] = useState<"favorites" | "saved-searches">("favorites");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: number | null; type: 'favorite' | 'search' }>({
    show: false, id: null, type: 'favorite'
  });
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userRaw);
    fetchData(user, token);
  }, [activeTab, router]);

  const fetchData = async (user: any, token: string) => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === "favorites") {
        const res = await fetch("http://localhost:8000/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch favorites");

        const data = await res.json();
        if (Array.isArray(data)) {
          const carsOnly = data.map((fav: any) => ({
            ...fav.car,
            is_favorite: true
          }));
          setCars(carsOnly);
          const indices: { [carId: number]: number } = {};
          carsOnly.forEach((c: CarData) => (indices[c.id] = 0));
          setImageIndex(indices);
        } else {
          console.error("Unexpected response:", data);
          setCars([]);
        }
      } else {
        const res = await fetch(`http://localhost:8000/saved-searches?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch saved searches");

        const data = await res.json();
        if (Array.isArray(data)) {
          setSavedSearches(data);
        } else {
          console.error("Unexpected response:", data);
          setSavedSearches([]);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
      setError(`Unable to load your ${activeTab === "favorites" ? "favorite cars" : "saved searches"}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearch = async (searchId: number) => {
    setConfirmDelete({ show: true, id: searchId, type: 'search' });
  };

  const confirmDeleteSearch = async () => {
    if (!confirmDelete.id) return;

    setActionLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`http://localhost:8000/saved-searches/${confirmDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== confirmDelete.id));
        showSuccess("Search deleted successfully");
      } else {
        showError("Failed to delete saved search");
      }
    } catch (error) {
      console.error("Error deleting saved search:", error);
      showError("Failed to delete saved search");
    } finally {
      setActionLoading(false);
      setConfirmDelete({ show: false, id: null, type: 'search' });
    }
  };

  const { toggleFavorite, isUpdatingFavorite } = useFavorites(
    (carId, newState) => {
      if (!newState) {
        setCars((prev) => prev.filter((c) => c.id !== carId));
        showSuccess("Car removed from favorites");
      }
    },
    (error) => {
      showError(`Error: ${error}`);
    }
  );

  const handleFavoriteToggle = async (car: CarData) => {
    setConfirmDelete({ show: true, id: car.id, type: 'favorite' });
  };

  const confirmDeleteFavorite = async () => {
    if (!confirmDelete.id) return;

    const carToRemove = cars.find(c => c.id === confirmDelete.id);
    if (carToRemove) {
      await toggleFavorite(carToRemove);
    }

    setConfirmDelete({ show: false, id: null, type: 'favorite' });
  };

  const formatSearchTags = (query: string) => {
    const params = new URLSearchParams(query);
    const tags: { label: string, value: string }[] = [];

    if (params.get("search")) {
      tags.push({
        label: "Search",
        value: params.get("search")!
      });
    }

    if (params.get("brand")) {
      tags.push({
        label: "Brand",
        value: params.get("brand")!
      });
    }

    if (params.get("model")) {
      tags.push({
        label: "Model",
        value: params.get("model")!
      });
    }

    if (params.get("year_min") || params.get("year_max")) {
      let yearValue = "";
      if (params.get("year_min") && params.get("year_max")) {
        yearValue = `${params.get("year_min")} - ${params.get("year_max")}`;
      } else if (params.get("year_min")) {
        yearValue = `From ${params.get("year_min")}`;
      } else if (params.get("year_max")) {
        yearValue = `Until ${params.get("year_max")}`;
      }

      tags.push({
        label: "Year",
        value: yearValue
      });
    }

    if (params.get("min_price") || params.get("max_price")) {
      let priceValue = "";
      if (params.get("min_price") && params.get("max_price")) {
        priceValue = `€${parseInt(params.get("min_price")!).toLocaleString()} - €${parseInt(params.get("max_price")!).toLocaleString()}`;
      } else if (params.get("min_price")) {
        priceValue = `From €${parseInt(params.get("min_price")!).toLocaleString()}`;
      } else if (params.get("max_price")) {
        priceValue = `Up to €${parseInt(params.get("max_price")!).toLocaleString()}`;
      }

      tags.push({
        label: "Price",
        value: priceValue
      });
    }

    if (params.get("fuel_type")) {
      tags.push({
        label: "Fuel",
        value: params.get("fuel_type")!
      });
    }

    if (params.get("transmission")) {
      tags.push({
        label: "Transmission",
        value: params.get("transmission")!
      });
    }

    if (params.get("is_new")) {
      tags.push({
        label: "Status",
        value: params.get("is_new") === "true" ? "New" : "Used"
      });
    }

    if (params.get("mileage_min") || params.get("mileage_max")) {
      let mileageValue = "";
      if (params.get("mileage_min") && params.get("mileage_max")) {
        mileageValue = `${parseInt(params.get("mileage_min")!).toLocaleString()} - ${parseInt(params.get("mileage_max")!).toLocaleString()} km`;
      } else if (params.get("mileage_min")) {
        mileageValue = `Min ${parseInt(params.get("mileage_min")!).toLocaleString()} km`;
      } else if (params.get("mileage_max")) {
        mileageValue = `Max ${parseInt(params.get("mileage_max")!).toLocaleString()} km`;
      }

      tags.push({
        label: "Mileage",
        value: mileageValue
      });
    }

    if (params.get("engine_power_min") || params.get("engine_power_max")) {
      let powerValue = "";
      if (params.get("engine_power_min") && params.get("engine_power_max")) {
        powerValue = `${params.get("engine_power_min")} - ${params.get("engine_power_max")} hp`;
      } else if (params.get("engine_power_min")) {
        powerValue = `Min ${params.get("engine_power_min")} hp`;
      } else if (params.get("engine_power_max")) {
        powerValue = `Max ${params.get("engine_power_max")} hp`;
      }

      tags.push({
        label: "Power",
        value: powerValue
      });
    }

    if (params.get("engine_capacity_min") || params.get("engine_capacity_max")) {
      let capacityValue = "";
      if (params.get("engine_capacity_min") && params.get("engine_capacity_max")) {
        capacityValue = `${params.get("engine_capacity_min")} - ${params.get("engine_capacity_max")} cc`;
      } else if (params.get("engine_capacity_min")) {
        capacityValue = `Min ${params.get("engine_capacity_min")} cc`;
      } else if (params.get("engine_capacity_max")) {
        capacityValue = `Max ${params.get("engine_capacity_max")} cc`;
      }

      tags.push({
        label: "Engine",
        value: capacityValue
      });
    }

    if (params.get("seller_type")) {
      tags.push({
        label: "Seller",
        value: params.get("seller_type")!
      });
    }

    if (params.get("deal_rating")) {
      const ratingMap: { [key: string]: string } = {
        "S": "Exceptional",
        "A": "Very Good",
        "B": "Good",
        "C": "Fair"
      };

      tags.push({
        label: "Deal",
        value: ratingMap[params.get("deal_rating")!] || params.get("deal_rating")!
      });
    }

    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <div key={idx} className="inline-flex items-center bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-blue-700">{tag.label}:</span>
            <span className="text-xs text-blue-900 ml-1.5">{tag.value}</span>
          </div>
        ))}
        {tags.length === 0 && <span className="text-gray-500 italic">No filters applied</span>}
      </div>
    );
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <Navbar />

      <div className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Collection</h1>
          <button
            onClick={() => router.push("/listings")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Explore More Cars
          </button>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-full shadow-md p-1.5 inline-flex">
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${activeTab === "favorites"
                ? "bg-blue-600 text-white shadow"
                : "bg-transparent text-gray-600 hover:bg-gray-100"
                }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorite Cars
              </div>
            </button>
            <button
              onClick={() => setActiveTab("saved-searches")}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${activeTab === "saved-searches"
                ? "bg-blue-600 text-white shadow"
                : "bg-transparent text-gray-600 hover:bg-gray-100"
                }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Saved Searches
              </div>
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center text-gray-700 py-8 bg-red-50 rounded-xl border border-red-100 mb-8">
            <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold text-red-600">{error}</p>
            <button
              onClick={() => {
                const token = localStorage.getItem("token");
                const userRaw = localStorage.getItem("user");
                if (token && userRaw) {
                  const user = JSON.parse(userRaw);
                  fetchData(user, token);
                }
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!error && activeTab === "favorites" && (
          <div>
            {loading ? (
              renderSkeletons()
            ) : cars.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Favorite Cars Yet</h2>
                  <p className="text-gray-600 mb-6">Start exploring and add cars to your favorites to keep track of vehicles you're interested in.</p>
                  <button
                    onClick={() => router.push("/listings")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Browse Listings
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    variant="grid"
                    onFavoriteToggle={handleFavoriteToggle}
                    isUpdatingFavorite={isUpdatingFavorite(car.id)}
                    showImageNavigation={true}
                    showQualityScore={true}
                    showEstimatedPrice={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!error && activeTab === "saved-searches" && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-md animate-pulse">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex gap-2">
                        <div className="h-10 w-24 bg-gray-200 rounded"></div>
                        <div className="h-10 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : savedSearches.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Saved Searches Yet</h2>
                  <p className="text-gray-600 mb-6">Save your search criteria to quickly access them later and find new matching cars.</p>
                  <button
                    onClick={() => router.push("/detailed-search")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Advanced Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 mb-6"
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">
                      Your saved searches allow you to quickly access your preferred filters and stay updated on new listings that match your criteria.
                    </p>
                  </div>
                </motion.div>

                {savedSearches.map((search) => (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-grow">
                        <div className="text-sm flex items-start gap-3 text-gray-700">
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <div>
                            {formatSearchTags(search.query)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-shrink-0">
                        <a
                          href={`/listings?${search.query}`}
                          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Results
                        </a>
                        <button
                          onClick={() => handleDeleteSearch(search.id)}
                          disabled={actionLoading}
                          className="bg-white border border-red-500 text-red-500 px-3 py-2.5 rounded-lg text-sm hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmDelete.show}
          title={confirmDelete.type === 'favorite' ? "Remove Favorite" : "Delete Saved Search"}
          message={confirmDelete.type === 'favorite'
            ? "Are you sure you want to remove this car from your favorites?"
            : "Are you sure you want to delete this saved search?"
          }
          confirmText={confirmDelete.type === 'favorite' ? "Remove" : "Delete"}
          cancelText="Cancel"
          onConfirm={confirmDelete.type === 'favorite' ? confirmDeleteFavorite : confirmDeleteSearch}
          onCancel={() => setConfirmDelete({ show: false, id: null, type: 'favorite' })}
          isLoading={actionLoading}
        />

      </div>

      <Footer />
    </main>
  );
}