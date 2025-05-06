"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SidebarFilters from "@/components/SidebarFilters";

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
  is_favorite?: boolean;
  deal_rating?: string;
  estimated_price?: number;
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

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="py-12 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 mb-8 lg:mb-0">
        <SidebarFilters setToastMessage={setToastMessage} setToastType={setToastType} />
        </div>

        {/* Listings */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Car Listings</h1>
              <p className="text-sm text-gray-600">
                {loading ? "Loading..." : `Showing ${cars.length} of ${total} cars`}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <label htmlFor="limit" className="text-sm text-gray-700 font-medium">
                Cars per page
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => updateLimit(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-4 py-2 text-sm"
              >
                {[9, 15, 30, 60].map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => {
              const imgs = parseImages(car.images);
              const current = imageIndex[car.id] || 0;
              const imageUrl = imgs[current] || "/default-car.webp";

              return (
                <a
                  key={car.id}
                  href={`/listings/${car.id}`}
                  className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex flex-col group relative"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(car);
                    }}
                    className={`absolute top-2 left-2 text-2xl z-10 transition transform ${
                      car.is_favorite ? "text-red-500 scale-110" : "text-gray-400"
                    } ${updatingFavorites.includes(car.id) ? "opacity-50" : "opacity-100"}`}
                    disabled={updatingFavorites.includes(car.id)}
                  >
                    {car.is_favorite ? "❤️" : "🤍"}
                  </button>

                  <div className="relative w-full">
                    <Image
                      src={imageUrl}
                      alt={car.title}
                      width={400}
                      height={300}
                      className="rounded-lg object-cover w-full h-[180px]"
                    />
                    {imgs.length > 1 && (
                      <>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
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
                          className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          ⬅
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
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          ➡
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mt-2">
                    <h3 className="font-semibold text-lg">{car.title}</h3>
                    <p className="text-sm text-gray-600">
                      {car.year} • {car.fuel_type} • {car.transmission}
                    </p>
                    <p className="text-blue-600 font-semibold mt-1">
                      {car.price !== null
                        ? `€${car.price.toLocaleString()}`
                        : "Price not available"}
                    </p>
                    {car.estimated_price && (
                      <p className="text-sm text-gray-500">
                        Estimated Price: €{car.estimated_price.toLocaleString()}
                      </p>
                    )}

                    {car.deal_rating && (() => {
                      const rating = getRatingBar(car.deal_rating);
                      if (!rating) return null;

                      return (
                        <div className={`w-full mt-2 rounded text-xs py-1 text-center font-semibold ${rating.color} ${rating.textColor}`}>
                          {rating.label}
                        </div>
                      );
                    })()}

                  </div>
                </a>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-10 gap-2 flex-wrap">
            {getDisplayedPages().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={idx}
                  onClick={() => goToPage(p)}
                  className={`px-4 py-2 rounded-full border ${p === page ? "bg-gray-200" : ""}`}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="px-2 py-2 text-gray-500 select-none">...</span>
              )
            )}
          </div>
        </div>
      </section>

      <Footer />
      {toastMessage && (
      <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg transition-all z-50 ${
        toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}>
        {toastMessage}
      </div>
      )}
    </main>
  );
}
