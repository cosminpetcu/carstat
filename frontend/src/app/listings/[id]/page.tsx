"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";

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
};

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8000/cars/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCar(data);

        if (typeof data.images === "string") {
          try {
            const parsed = JSON.parse(data.images);
            if (Array.isArray(parsed)) {
              setImages(parsed);
            }
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

  if (loading || !car) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="bg-white text-black">
      <Navbar />

      <section className="pt-36 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{car.title}</h1>
            <p className="text-gray-600 mb-4">{car.brand} {car.model} • {car.year ?? "N/A"} • {car.transmission}</p>

            {/* Galerie imagini */}
            {images.length > 0 ? (
              <div className="relative w-full max-w-[800px] max-h-[500px] mx-auto">
                <Image
                  src={images[currentIndex]}
                  alt={`Image ${currentIndex + 1}`}
                  width={800}
                  height={500}
                  className="rounded-xl w-full h-auto object-cover max-h-[500px]"
                />

                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>

                <button
                  type="button"
                  onClick={prevImage}
                  disabled={currentIndex === 0}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
                >
                  ⬅
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  disabled={currentIndex === images.length - 1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
                >
                  ➡
                </button>
              </div>
            ) : (
              <div className="w-full h-[300px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                No images available
              </div>
            )}

            {/* Overview */}
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
                <li>Android Auto</li>
                <li>Camera spate</li>
                <li>Senzori parcare</li>
                <li>Climatronic</li>
                <li>Volan piele</li>
                <li>Scaune încălzite</li>
              </ul>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="w-full h-[300px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                {car.location || "Map Placeholder"}
              </div>
            </div>
          </div>

          {/* Detalii laterale */}
          <div className="md:w-1/3 bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm line-through">
              {typeof car.price === "number" ? `€${(car.price * 1.05).toLocaleString()}` : "Price N/A"}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {typeof car.price === "number" ? `€${car.price.toLocaleString()}` : "Price not available"}
            </p>
            <p className="text-sm text-green-600 mb-4">Instant saving: 5%</p>

            <button className="w-full bg-blue-600 text-white py-2 rounded-md mb-2">Make an Offer</button>
            <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-md mb-2">Schedule Test Drive</button>

            {car.source_url && (
              <a
                href={car.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full bg-black text-white py-2 rounded-md text-sm"
              >
                🔗 View original ad
              </a>
            )}

            <div className="mt-6 text-sm">
              <p><strong>Dealer:</strong> CarStat Admin</p>
              <p><strong>Phone:</strong> +40 712 345 678</p>
              <p><strong>Email:</strong> admin@carstat.ro</p>
              <button className="mt-2 bg-green-500 text-white px-4 py-1 rounded-md">Contact on WhatsApp</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-bold mb-2">Company</h3>
            <ul className="space-y-1 text-sm">
              <li>About Us</li>
              <li>Services</li>
              <li>FAQs</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li>Help Center</li>
              <li>How it works</li>
              <li>Sign Up</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Our Brands</h3>
            <ul className="space-y-1 text-sm">
              <li>Audi</li>
              <li>BMW</li>
              <li>Ford</li>
              <li>Volkswagen</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Get Updates</h3>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 text-black rounded-md mb-2"
            />
            <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-md">
              Sign Up
            </button>
          </div>
        </div>
        <p className="text-center text-sm mt-8">© 2025 carstat.com. All rights reserved.</p>
      </footer>
    </main>
  );
}
