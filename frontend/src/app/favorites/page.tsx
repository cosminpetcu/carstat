"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

type Car = {
  id: number;
  title: string;
  price: number;
  year: number;
  fuel_type: string;
  transmission: string;
  images: string[] | string;
  is_favorite?: boolean;
};

type SavedSearch = {
  id: number;
  query: string;
};

export default function FavoritesPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState<{ [carId: number]: number }>({});
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"favorites" | "saved-searches">("favorites");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userRaw);

    if (activeTab === "favorites") {
      fetch("http://localhost:8000/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const carsOnly = data.map((fav: any) => fav.car);
            setCars(carsOnly);
            const indices: { [carId: number]: number } = {};
            carsOnly.forEach((c: Car) => (indices[c.id] = 0));
            setImageIndex(indices);
          } else {
            console.error("Unexpected response:", data);
            setCars([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch favorites:", err);
          setLoading(false);
        });
    } else {
      fetch(`http://localhost:8000/saved-searches?user_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSavedSearches(data);
          } else {
            console.error("Unexpected response:", data);
            setSavedSearches([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch saved searches:", err);
          setLoading(false);
        });
    }
  }, [activeTab, router]);

  const handleDeleteSearch = async (searchId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this saved search?");
    if (!confirmDelete) return;
  
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
  
    try {
      const res = await fetch(`http://localhost:8000/saved-searches/${searchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
      } else {
        console.error("Failed to delete saved search");
      }
    } catch (error) {
      console.error("Error deleting saved search:", error);
    }
  };
  
  

  const toggleFavorite = async (car: Car) => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token || !userRaw) return router.push("/login");

    let user;
    try {
      user = JSON.parse(userRaw);
      if (!user.id) throw new Error("Invalid user");
    } catch {
      return router.push("/login");
    }

    setUpdatingFavorites((prev) => [...prev, car.id]);

    try {
      await fetch(`http://localhost:8000/favorites/${car.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setCars((prev) => prev.filter((c) => c.id !== car.id));
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setUpdatingFavorites((prev) => prev.filter((id) => id !== car.id));
    }
  };

  const parseImages = (images: string[] | string): string[] => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleTabChange = (tab: "favorites" | "saved-searches") => {
    setLoading(true);
    setActiveTab(tab);
  };

  const formatSavedSearch = (query: string) => {
    const params = new URLSearchParams(query);
    const parts: string[] = [];
  
    if (params.get("brand")) parts.push(params.get("brand")!);
    if (params.get("model")) parts.push(params.get("model")!);
    if (params.get("fuel_type")) parts.push(`Fuel: ${params.get("fuel_type")}`);
    if (params.get("is_new")) parts.push(params.get("is_new") === "true" ? "New" : "Used");
    if (params.get("min_price")) parts.push(`Min Price: €${params.get("min_price")}`);
    if (params.get("max_price")) parts.push(`Max Price: €${params.get("max_price")}`);
    if (params.get("year_min")) parts.push(`Year from: ${params.get("year_min")}`);
    if (params.get("year_max")) parts.push(`Year to: ${params.get("year_max")}`);
    if (params.get("mileage_min")) parts.push(`Mileage min: ${params.get("mileage_min")} km`);
    if (params.get("mileage_max")) parts.push(`Mileage max: ${params.get("mileage_max")} km`);
    if (params.get("engine_power_min")) parts.push(`Power min: ${params.get("engine_power_min")} hp`);
    if (params.get("engine_power_max")) parts.push(`Power max: ${params.get("engine_power_max")} hp`);
    if (params.get("engine_capacity_min")) parts.push(`Capacity min: ${params.get("engine_capacity_min")} cc`);
    if (params.get("engine_capacity_max")) parts.push(`Capacity max: ${params.get("engine_capacity_max")} cc`);
    if (params.get("seller_type")) parts.push(`Seller: ${params.get("seller_type")}`);
  
    return parts.join(" • ");
  };
  

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="py-12 px-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-6">
          <button
            onClick={() => handleTabChange("favorites")}
            className={`px-6 py-2 rounded-full font-semibold ${activeTab === "favorites" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          >
            Favorites
          </button>
          <button
            onClick={() => handleTabChange("saved-searches")}
            className={`px-6 py-2 rounded-full font-semibold ${activeTab === "saved-searches" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
          >
            Saved Searches
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : activeTab === "favorites" ? (
          cars.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <p className="text-xl font-semibold">You don't have any favorite cars yet.</p>
              <p className="text-sm mt-2">Browse listings and tap the ❤️ icon to save them here.</p>
              <button
                onClick={() => router.push("/listings")}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Browse Listings
              </button>
            </div>
          ) : (
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
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(car);
                      }}
                      className="absolute top-2 left-2 text-2xl z-10"
                      disabled={updatingFavorites.includes(car.id)}
                    >
                      ❤️
                    </button>

                    <div className="relative w-full">
                      <Image
                        src={imageUrl}
                        alt={car.title}
                        width={400}
                        height={300}
                        className="rounded-lg object-cover w-full h-[180px]"
                      />
                    </div>

                    <div className="mt-2">
                      <h3 className="font-semibold text-lg">{car.title}</h3>
                      <p className="text-sm text-gray-600">
                        {car.year} • {car.fuel_type} • {car.transmission}
                      </p>
                      <p className="text-blue-600 font-semibold mt-1">
                        {car.price !== null ? `€${car.price.toLocaleString()}` : "Price not available"}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )
        ) : (
          // Saved Searches tab
          savedSearches.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <p className="text-xl font-semibold">You don't have any saved searches yet.</p>
              <p className="text-sm mt-2">Use the sidebar filters and save a search.</p>
              <button
                onClick={() => router.push("/listings")}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Browse Listings
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedSearches.map((search) => (
                <div key={search.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-700 break-words">{formatSavedSearch(search.query)}</div>
                <div className="flex gap-2">
                  <a
                    href={`/listings?${search.query}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    View Results
                  </a>
                  <button
                    onClick={() => handleDeleteSearch(search.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              ))}
            </div>
          )
        )}
      </section>

      <Footer />
    </main>
  );
}
