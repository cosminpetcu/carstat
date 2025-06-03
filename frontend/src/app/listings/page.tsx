"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SidebarFilters from "@/components/SidebarFilters";
import { PendingActionsManager, getCurrentUrlForReturn } from '@/utils/pendingActions';
import { CarCard, type CarData } from "@/components/ui/CarCard";
import { useFavorites } from '@/hooks/useFavorites';

const sortOptions = [
  { value: "", label: "Default Order", sort_by: "", order: "asc" },
  { value: "price_asc", label: "Price: Low to High", sort_by: "price", order: "asc" },
  { value: "price_desc", label: "Price: High to Low", sort_by: "price", order: "desc" },
  { value: "year_asc", label: "Year: Oldest First", sort_by: "year", order: "asc" },
  { value: "year_desc", label: "Year: Newest First", sort_by: "year", order: "desc" },
  { value: "mileage_asc", label: "Mileage: Low to High", sort_by: "mileage", order: "asc" },
  { value: "mileage_desc", label: "Mileage: High to Low", sort_by: "mileage", order: "desc" },
  { value: "engine_power_asc", label: "Power: Low to High", sort_by: "engine_power", order: "asc" },
  { value: "engine_power_desc", label: "Power: High to Low", sort_by: "engine_power", order: "desc" },
];

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const [imageIndex, setImageIndex] = useState<{ [carId: number]: number }>({});
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    if (toastMessage) {
      const timeout = setTimeout(() => {
        setToastMessage("");
        setToastType("");
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [toastMessage]);

  useEffect(() => {
    const handleUrlChange = () => {
      window.location.reload();
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;

    const currentPage = parseInt(params.get("page") || "1");
    const currentLimit = parseInt(params.get("limit") || "9");

    setPage(currentPage);
    setLimit(currentLimit);

    const urlSortBy = params.get("sort_by") || "";
    const urlSortOrder = params.get("order") || "asc";

    const currentSortOption = sortOptions.find(
      option => option.sort_by === urlSortBy && option.order === urlSortOrder
    );

    setSortBy(currentSortOption?.value || "");

    params.set("page", currentPage.toString());
    params.set("limit", currentLimit.toString());

    if (user?.id && token) {
      params.set("user_id", user.id.toString());
    }

    const url = `http://localhost:8000/cars?${params.toString()}`;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setCars(data.items);
        setTotal(data.total);

        const initIndex: { [carId: number]: number } = {};
        data.items.forEach((car: CarData) => {
          initIndex[car.id] = 0;
        });
        setImageIndex(initIndex);

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const updateSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sortValue === "") {
      params.delete("sort_by");
      params.delete("order");
    } else {
      const selectedOption = sortOptions.find(option => option.value === sortValue);
      if (selectedOption && selectedOption.sort_by) {
        params.set("sort_by", selectedOption.sort_by);
        params.set("order", selectedOption.order);
      }
    }

    params.set("page", "1");
    router.push(`/listings?${params.toString()}`);
  };

  const { toggleFavorite, isUpdatingFavorite } = useFavorites(
    (carId, newState) => {
      setCars((prev) =>
        prev.map((c) =>
          c.id === carId ? { ...c, is_favorite: newState } : c
        )
      );
    },
    (error) => {
      setToastMessage(`Error: ${error}`);
      setToastType("error");
    }
  );

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    params.set("limit", limit.toString());
    router.push(`/listings?${params.toString()}`);
  };

  const updateLimit = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    params.set("page", "1");
    router.push(`/listings?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / limit);
  const getDisplayedPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const renderLoadingSkeleton = () => {
    return Array(limit).fill(0).map((_, idx) => (
      <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="h-[220px] bg-gray-200"></div>
        <div className="p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    ));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Car</h1>
          <p className="text-blue-100">Browse our extensive collection of quality vehicles</p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 lg:top-8 lg:self-start">
            <SidebarFilters setToastMessage={setToastMessage} setToastType={setToastType} />
          </div>

          <div className="w-full lg:w-3/4">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Available Cars</h2>
                  <p className="text-gray-500 text-sm">
                    {loading ? "Searching for cars..." : `Showing ${cars.length} of ${total} cars`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => updateSort(e.target.value)}
                      className="border border-gray-300 text-gray-600 rounded-md px-3 py-1.5 text-sm bg-white min-w-[180px]"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Per Page */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="limit" className="text-sm text-gray-600 whitespace-nowrap">
                      Per page:
                    </label>
                    <select
                      id="limit"
                      value={limit}
                      onChange={(e) => updateLimit(parseInt(e.target.value))}
                      className="border border-gray-300 text-gray-600 rounded-md px-2 py-1.5 text-sm bg-white"
                    >
                      {[9, 15, 30, 60].map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-6"
              }`}>
              {loading
                ? renderLoadingSkeleton()
                : cars.length > 0
                  ? cars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      variant={viewMode}
                      onFavoriteToggle={toggleFavorite}
                      isUpdatingFavorite={isUpdatingFavorite(car.id)}
                      showImageNavigation={true}
                      showQualityScore={true}
                      showEstimatedPrice={true}
                    />
                  ))
                  : (
                    <div className="col-span-full text-center py-16">
                      <div className="text-gray-400 text-5xl mb-4">🔍</div>
                      <h3 className="text-xl font-medium mb-2">No cars found</h3>
                      <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                    </div>
                  )
              }
            </div>

            {!loading && totalPages > 0 && (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex rounded-md shadow-sm bg-white">
                  <button
                    onClick={() => goToPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-l-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {getDisplayedPages().map((p, idx) =>
                    typeof p === "number" ? (
                      <button
                        key={idx}
                        onClick={() => goToPage(p)}
                        className={`px-4 py-2 border-t border-b border-r border-gray-300 ${p === page
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={idx} className="px-2 py-2 border-t border-b border-r border-gray-300 text-gray-500 select-none">
                        ...
                      </span>
                    )
                  )}

                  <button
                    onClick={() => goToPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded-r-md border-t border-b border-r border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg transition-all z-50 flex items-center ${toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
        >
          <span className="mr-2">{toastType === "success" ? "✓" : "✕"}</span>
          {toastMessage}
        </div>
      )}
    </main>
  );
}