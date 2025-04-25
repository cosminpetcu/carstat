"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
};

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(16);
  const [total, setTotal] = useState(0);
  const [imageIndex, setImageIndex] = useState<{ [carId: number]: number }>({});
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
  
    const currentPage = parseInt(params.get("page") || "1");
    const currentLimit = parseInt(params.get("limit") || "16");
  
    setPage(currentPage);
    setLimit(currentLimit);
  
    params.set("page", currentPage.toString());
    params.set("limit", currentLimit.toString());
  
    if (user?.id) {
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

      <section className="py-12 px-6 max-w-7xl mx-auto">
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
              {[8, 16, 32, 64].map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </section>

      <Footer />
    </main>
  );
}
