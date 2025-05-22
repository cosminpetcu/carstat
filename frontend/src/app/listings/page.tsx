"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SidebarFilters from "@/components/SidebarFilters";
import { EngineIcon, GaugeIcon, CalendarIcon, FuelIcon, TransmissionIcon, SpeedometerIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

type Car = {
  id: number;
  title: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  fuel_type: string;
  mileage: number;
  transmission: string;
  images: string[] | string;
  engine_capacity?: number;
  sold?: boolean;
  is_favorite?: boolean;
  deal_rating?: string;
  estimated_price?: number;
  engine_power?: number;
  quality_score?: number;
  suspicious_price?: boolean;
};

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const [imageIndex, setImageIndex] = useState<{ [carId: number]: number }>({});
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "">("");
  const [viewMode, setViewMode] = useState("grid");

  const getQualityScoreColor = (quality_score: number | undefined) => {
    if (!quality_score) return "bg-gray-300";
    if (quality_score >= 80) return "bg-green-500";
    if (quality_score >= 60) return "bg-green-400";
    if (quality_score >= 40) return "bg-yellow-400";
    if (quality_score >= 20) return "bg-orange-400";
    return "bg-red-500";
  };

  useEffect(() => {
    if (toastMessage) {
      const timeout = setTimeout(() => {
        setToastMessage("");
        setToastType("");
      }, 3000);
  
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
        data.items.forEach((car: Car) => {
          initIndex[car.id] = 0;
        });
        setImageIndex(initIndex);

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const toggleFavorite = async (car: Car) => {
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

    setUpdatingFavorites((prev) => [...prev, car.id]);

    try {
      if (car.is_favorite) {
        await fetch(`http://localhost:8000/favorites/${car.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await fetch("http://localhost:8000/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            car_id: car.id,
          }),
        });
      }

      setCars((prev) =>
        prev.map((c) =>
          c.id === car.id ? { ...c, is_favorite: !car.is_favorite } : c
        )
      );
    } catch (err) {
      console.error("Favorite toggle failed", err);
    } finally {
      setUpdatingFavorites((prev) => prev.filter((id) => id !== car.id));
    }
  };

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

  const parseImages = (images: string[] | string): string[] => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getRatingBar = (rating: string | undefined) => {
    switch (rating?.toUpperCase()) {
      case "S":
        return { label: "Exceptional Price", color: "bg-green-700", textColor: "text-white" };
      case "A":
        return { label: "Very Good Price", color: "bg-lime-600", textColor: "text-white" };
      case "B":
        return { label: "Good Price", color: "bg-emerald-500", textColor: "text-white" };
      case "C":
        return { label: "Fair Price", color: "bg-yellow-400", textColor: "text-black" };
      case "D":
        return { label: "Expensive", color: "bg-orange-500", textColor: "text-white" };
      case "E":
        return { label: "Very Expensive", color: "bg-rose-500", textColor: "text-white" };
      case "F":
        return { label: "Overpriced", color: "bg-red-700", textColor: "text-white" };
      default:
        return null;
    }
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

  const renderGridCard = (car: Car) => {
    const imgs = parseImages(car.images);
    const current = imageIndex[car.id] || 0;
    const imageUrl = imgs[current] || "/default-car.webp";
    const rating = getRatingBar(car.deal_rating);

    return (
      <div key={car.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <a href={`/listings/${car.id}`} className="block">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(car);
              }}
              className={`absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full ${car.is_favorite ? "bg-red-50" : "bg-gray-50"} backdrop-blur-sm shadow-md transition-all duration-300 ${
                updatingFavorites.includes(car.id) ? "opacity-50" : "opacity-100"
              }`}
              disabled={updatingFavorites.includes(car.id)}
            >
              <span className="text-2xl">{car.is_favorite ? "❤️" : "🤍"}</span>
            </button>

            <div className="relative h-[220px] w-full">
              <Image
                src={imageUrl}
                alt={car.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {imgs.length > 1 && (
                <>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                    {current + 1} / {imgs.length}
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImageIndex((prev) => ({
                        ...prev,
                        [car.id]: Math.max((prev[car.id] || 0) - 1, 0),
                      }));
                    }}
                    disabled={current === 0}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeftIcon />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImageIndex((prev) => ({
                        ...prev,
                        [car.id]: Math.min((prev[car.id] || 0) + 1, imgs.length - 1),
                      }));
                    }}
                    disabled={current === imgs.length - 1}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRightIcon />
                  </button>
                </>
              )}

              {car.sold && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-md font-medium">
                  Sold
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{car.title}</h3>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1.5" />
                  <span>{car.year}</span>
                </div>
                <div className="flex items-center">
                  <FuelIcon className="w-4 h-4 mr-1.5" />
                  <span>{car.fuel_type}</span>
                </div>
                <div className="flex items-center">
                  <GaugeIcon className="w-4 h-4 mr-1.5" />
                  <span>{car.mileage?.toLocaleString()} km</span>
                </div>
                <div className="flex items-center">
                  <TransmissionIcon className="w-4 h-4 mr-1.5" />
                  <span>{car.transmission}</span>
                </div>
                {car.engine_capacity && (
                  <div className="flex items-center">
                    <EngineIcon className="w-4 h-4 mr-1.5" />
                    <span>{car.engine_capacity} cm³</span>
                  </div>
                )}
                {car.engine_power && (
                  <div className="flex items-center">
                    <SpeedometerIcon className="w-4 h-4 mr-1.5" />
                    <span>{car.engine_power} hp</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <div className="text-xl font-bold text-blue-600">
                    {car.price !== null
                      ? `€${car.price.toLocaleString()}`
                      : "Price on request"}
                  </div>
                  
                  {car.estimated_price && (
                    <div className="text-sm text-gray-500">
                      Est. Value: €{car.estimated_price.toLocaleString()}
                    </div>
                  )}
                </div>
                
                {car.quality_score !== undefined && (
                  <div className="relative">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white cursor-pointer ${
                        car.quality_score >= 80 ? "bg-green-500" : 
                        car.quality_score >= 60 ? "bg-green-400" : 
                        car.quality_score >= 40 ? "bg-yellow-400" : 
                        car.quality_score >= 20 ? "bg-orange-500" : 
                        "bg-red-500"
                      }`}
                      title="Quality Score"
                    >
                      {car.quality_score}
                    </div>
                  </div>
                )}
              </div>

              {rating && (
                <div className={`mt-3 w-full py-1.5 text-center text-xs font-semibold rounded-md ${rating.color} ${rating.textColor}`}>
                  {rating.label}
                </div>
              )}

              {car.suspicious_price && (
                <div className="mt-2 flex items-center text-red-500">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs">Suspicious Price</span>
                </div>
              )}
            </div>
          </div>
        </a>
      </div>
    );
  };

  const renderListCard = (car: Car) => {
    const imgs = parseImages(car.images);
    const current = imageIndex[car.id] || 0;
    const imageUrl = imgs[current] || "/default-car.webp";
    const rating = getRatingBar(car.deal_rating);

    return (
      <div key={car.id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
        <a href={`/listings/${car.id}`} className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/3 h-[220px] md:h-auto">
            <Image
              src={imageUrl}
              alt={car.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(car);
              }}
              className={`absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full ${car.is_favorite ? "bg-red-50" : "bg-gray-50"} backdrop-blur-sm shadow-md transition-all duration-300 ${
                updatingFavorites.includes(car.id) ? "opacity-50" : "opacity-100"
              }`}
              disabled={updatingFavorites.includes(car.id)}
            >
              <span className="text-2xl">{car.is_favorite ? "❤️" : "🤍"}</span>
            </button>
            
            {imgs.length > 1 && (
              <>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                  {current + 1} / {imgs.length}
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex((prev) => ({
                      ...prev,
                      [car.id]: Math.max((prev[car.id] || 0) - 1, 0),
                    }));
                  }}
                  disabled={current === 0}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ChevronLeftIcon />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex((prev) => ({
                      ...prev,
                      [car.id]: Math.min((prev[car.id] || 0) + 1, imgs.length - 1),
                    }));
                  }}
                  disabled={current === imgs.length - 1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ChevronRightIcon />
                </button>
              </>
            )}

            {car.sold && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-md font-medium">
                Sold
              </div>
            )}
          </div>
          
          <div className="w-full md:w-2/3 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{car.title}</h3>
                <p className="text-sm text-gray-500">{car.brand} {car.model}</p>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {car.price !== null ? `€${car.price.toLocaleString()}` : "Price on request"}
                </div>
                {car.estimated_price && (
                  <div className="text-sm text-gray-500">
                    Est. Value: €{car.estimated_price.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm text-gray-600 my-4">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                <span>{car.year}</span>
              </div>
              <div className="flex items-center">
                <FuelIcon className="w-4 h-4 mr-1.5" />
                <span>{car.fuel_type}</span>
              </div>
              <div className="flex items-center">
                <GaugeIcon className="w-4 h-4 mr-1.5" />
                <span>{car.mileage?.toLocaleString()} km</span>
              </div>
              <div className="flex items-center">
                <TransmissionIcon className="w-4 h-4 mr-1.5" />
                <span>{car.transmission}</span>
              </div>
              {car.engine_capacity && (
                <div className="flex items-center">
                  <EngineIcon className="w-4 h-4 mr-1.5" />
                  <span>{car.engine_capacity} cm³</span>
                </div>
              )}
              {car.engine_power && (
                <div className="flex items-center">
                  <SpeedometerIcon className="w-4 h-4 mr-1.5" />
                  <span>{car.engine_power} hp</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              {rating && (
                <div className={`w-auto md:w-48 py-1.5 text-center text-xs font-semibold rounded-md ${rating.color} ${rating.textColor}`}>
                  {rating.label}
                </div>
              )}
              
              {car.quality_score !== undefined && (
                <div className="relative">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white cursor-pointer ${getQualityScoreColor(car.quality_score)}`}
                    title="Quality Score"
                  >
                    {car.quality_score}
                  </div>
                </div>
              )}
            </div>
            
            {car.suspicious_price && (
              <div className="mt-2 flex items-center text-red-500">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs">Suspicious Price</span>
              </div>
            )}
          </div>
        </a>
      </div>
    );
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
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Available Cars</h2>
                  <p className="text-gray-500 text-sm">
                    {loading ? "Searching for cars..." : `Showing ${cars.length} of ${total} cars`}
                  </p>
                </div>

                <div className="flex gap-4 items-center">
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
                </div>
              </div>
            </div>

            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "flex flex-col gap-6"
            }`}>
              {loading 
                ? renderLoadingSkeleton()
                : cars.length > 0 
                  ? cars.map((car) => viewMode === "grid" ? renderGridCard(car) : renderListCard(car))
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
                        className={`px-4 py-2 border-t border-b border-r border-gray-300 ${
                          p === page 
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
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg transition-all z-50 flex items-center ${
            toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <span className="mr-2">{toastType === "success" ? "✓" : "✕"}</span>
          {toastMessage}
        </div>
      )}
    </main>
  );
}