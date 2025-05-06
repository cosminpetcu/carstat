"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Car = {
  id: number;
  title: string;
  brand: string;
  model: string;
  price: number | null;
  year: number | null;
  mileage: number | null;
  fuel_type: string;
  transmission: string;
  description?: string;
  location?: string;
  images: string[] | string;
  source_url?: string;
  is_favorite?: boolean;
  deal_rating?: string;
  estimated_price?: number;
};

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
  
    let url = `http://localhost:8000/cars/${id}`;
    if (user?.id && token) {
      url += `?user_id=${user.id}`;
    }
  
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (!token) {
          data.is_favorite = false;
        }
        setCar(data);
  
        if (typeof data.images === "string") {
          try {
            const parsed = JSON.parse(data.images);
            if (Array.isArray(parsed)) setImages(parsed);
          } catch (err) {
            console.error("Failed to parse images JSON", err);
          }
        } else if (Array.isArray(data.images)) {
          setImages(data.images);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch car", err);
        setLoading(false);
      });
  }, [id]);
  

  const nextImage = () => {
    if (images.length > 0 && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (images.length > 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userRaw);
    try {
      if (car?.is_favorite) {
        await fetch(`http://localhost:8000/favorites/${car.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`http://localhost:8000/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            car_id: car?.id,
          }),
        });
      }
      setCar((prev) => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  if (loading || !car) return <main className="p-6">Loading...</main>;

  return (
    <main className="bg-white text-black">
      <Navbar />
      <section className="pt-36 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="md:w-2/3">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{car.title}</h1>
              <button onClick={toggleFavorite} className="text-2xl" title="Toggle favorite">
                {car.is_favorite ? "❤️" : "🤍"}
              </button>
            </div>
            <p className="text-gray-600 mb-4">{car.brand} {car.model} • {car.year ?? "N/A"} • {car.transmission}</p>
            {images.length > 0 ? (
              <div className="relative w-full max-w-[800px] max-h-[500px] mx-auto">
                <Image src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} width={800} height={500}
                  className="rounded-xl w-full h-auto object-cover max-h-[500px]" />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>
                <button onClick={prevImage} disabled={currentIndex === 0}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded">
                  ⬅
                </button>
                <button onClick={nextImage} disabled={currentIndex === images.length - 1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded">
                  ➡
                </button>
              </div>
            ) : (
              <div className="w-full h-[300px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                No images available
              </div>
            )}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Car Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Make:</strong> {car.brand || "N/A"}</div>
                <div><strong>Model:</strong> {car.model || "N/A"}</div>
                <div><strong>Year:</strong> {car.year ?? "N/A"}</div>
                <div><strong>Fuel:</strong> {car.fuel_type || "N/A"}</div>
                <div><strong>Mileage:</strong> {typeof car.mileage === "number" ? `${car.mileage.toLocaleString()} km` : "N/A"}</div>
                <div><strong>Transmission:</strong> {car.transmission || "N/A"}</div>
              </div>
            </div>
            {car.description && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{car.description}</p>
              </div>
            )}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm list-disc list-inside">
                <li>Android Auto</li><li>Camera spate</li><li>Senzori parcare</li>
                <li>Climatronic</li><li>Volan piele</li><li>Scaune încălzite</li>
              </ul>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="w-full h-[300px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                {car.location || "Map Placeholder"}
              </div>
            </div>
          </div>
          <div className="md:w-1/3 bg-gray-50 p-6 rounded-xl shadow-sm">
          {car.deal_rating && (() => {
            const rating = getRatingBar(car.deal_rating);
            if (!rating) return null;

            return (
              <div className={`w-full rounded text-sm font-semibold py-1 px-2 mb-2 text-center ${rating.color} ${rating.textColor}`}>
                {rating.label}
              </div>
            );
          })()}

          <p className="text-2xl font-bold text-blue-600 mb-2">
            {typeof car.price === "number" ? `€${car.price.toLocaleString()}` : "Price not available"}
          </p>

          <p className="text-sm text-gray-600 mb-4">
            {typeof car.estimated_price === "number"
              ? `Estimated market price: €${car.estimated_price.toFixed(2)}`
              : "Estimated price not available"}
          </p>

            {car.source_url && (
              <a href={car.source_url} target="_blank" rel="noopener noreferrer"
                className="block text-center w-full bg-black text-white py-2 rounded-md text-sm">
                🔗 View original ad
              </a>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}