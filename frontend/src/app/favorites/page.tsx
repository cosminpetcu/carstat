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

export default function FavoritesPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState<{ [carId: number]: number }>({});
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetch("http://localhost:8000/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    }
  }, [router]);

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

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">My Favorite Cars</h1>

        {cars.length === 0 && !loading ? (
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
        )}
      </section>

      <Footer />
    </main>
  );
}
