"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SidebarFilters from "@/components/SidebarFilters";
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { CarCard, type CarData } from "@/components/ui/CarCard";
import { useFavorites } from '@/hooks/useFavorites';
import { CarCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useTranslations, useLocale } from 'next-intl';
import IntlProvider from '@/components/IntlProvider';

function ListingsContent() {
  const t = useTranslations('listings');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Folosește useMemo pentru sortOptions pentru a preveni recrearea constantă
  const sortOptions = useMemo(() => [
    { value: "", label: t('defaultOrder'), sort_by: "", order: "asc" },
    { value: "price_asc", label: t('priceLowToHigh'), sort_by: "price", order: "asc" },
    { value: "price_desc", label: t('priceHighToLow'), sort_by: "price", order: "desc" },
    { value: "year_asc", label: t('yearOldestFirst'), sort_by: "year", order: "asc" },
    { value: "year_desc", label: t('yearNewestFirst'), sort_by: "year", order: "desc" },
    { value: "mileage_asc", label: t('mileageLowToHigh'), sort_by: "mileage", order: "asc" },
    { value: "mileage_desc", label: t('mileageHighToLow'), sort_by: "mileage", order: "desc" },
    { value: "engine_power_asc", label: t('powerLowToHigh'), sort_by: "engine_power", order: "asc" },
    { value: "engine_power_desc", label: t('powerHighToLow'), sort_by: "engine_power", order: "desc" },
  ], [t]);

  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("");

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
    router.push(`/${locale}/listings?${params.toString()}`);
  };

  const { toggleFavorite, isUpdatingFavorite } = useFavorites(
    (carId, newState) => {
      setCars((prev) =>
        prev.map((c) =>
          c.id === carId ? { ...c, is_favorite: newState } : c
        )
      );
      showSuccess(newState ? t('addedToFavorites') : t('removedFromFavorites'));
    },
    (error) => {
      showError(`${t('error')} ${error}`);
    }
  );

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    params.set("limit", limit.toString());
    router.push(`/${locale}/listings?${params.toString()}`);
  };

  const updateLimit = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    params.set("page", "1");
    router.push(`/${locale}/listings?${params.toString()}`);
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
      <CarCardSkeleton key={idx} variant={viewMode as "grid" | "list"} />
    ));
  };

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

    if (!params.has("sold")) {
      params.set("sold", "false");
      router.replace(`/${locale}/listings?${params.toString()}`, { scroll: false });
      return;
    }

    if (user?.id && token) {
      params.set("user_id", user.id.toString());
    }

    const url = `http://localhost:8000/cars?${params.toString()}`;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setCars(data.items);
          setTotal(data.total);
        } else {
          console.error("Invalid response:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cars:", err);
        setLoading(false);
      });
  }, [searchParams, router, locale, sortOptions]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />


      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4">
            <SidebarFilters
              showSuccess={showSuccess}
              showError={showError}
            />
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('carListings')}</h1>
                  <p className="text-gray-600">
                    {loading ? t('searchingForCars') : t('showingCars', { count: cars.length, total })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
                      {t('sortBy')}
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
                      {t('perPage')}
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
                      {t('grid')}
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
                    >
                      {t('list')}
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
                    <div className="col-span-full text-center py-12">
                      <div className="max-w-md mx-auto">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.5a7.962 7.962 0 01-5.657-2.343m0 0L5 17m1.343 1.343l1.414-1.414L9 18.171" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noResults')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('tryDifferentFilters')}</p>
                      </div>
                    </div>
                  )}
            </div>

            {/* Pagination */}
            {!loading && cars.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('previous')}
                  </button>

                  {getDisplayedPages().map((pageNum, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof pageNum === 'number' && goToPage(pageNum)}
                      disabled={typeof pageNum !== 'number'}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === page
                        ? "bg-blue-600 text-white"
                        : typeof pageNum === 'number'
                          ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          : "text-gray-400 cursor-default"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('next')}
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

function Listings() {
  return (
    <IntlProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <ListingsContent />
      </Suspense>
    </IntlProvider>
  );
}

export default Listings;