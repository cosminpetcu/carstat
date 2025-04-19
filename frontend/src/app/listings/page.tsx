"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  source_url?: string;
};

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [currentIndices, setCurrentIndices] = useState<{ [key: number]: number }>({});

  const limit = 8;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const currentPage = parseInt(params.get("page") || "1");
    setPage(currentPage);

    params.set("limit", limit.toString());
    params.set("page", currentPage.toString());

    const url = `http://localhost:8000/cars?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCars(data);
        const initialIndices: { [key: number]: number } = {};
        data.forEach((car: Car) => {
          initialIndices[car.id] = 0;
        });
        setCurrentIndices(initialIndices);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch cars", err);
        setLoading(false);
      });
  }, [searchParams]);

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/listings?${params.toString()}`);
  };

  const nextImage = (carId: number, total: number) => {
    setCurrentIndices((prev) => ({
      ...prev,
      [carId]: Math.min((prev[carId] || 0) + 1, total - 1),
    }));
  };

  const prevImage = (carId: number) => {
    setCurrentIndices((prev) => ({
      ...prev,
      [carId]: Math.max((prev[carId] || 0) - 1, 0),
    }));
  };

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-10 py-6 z-30 bg-gray-900 text-white border-b">
        <div className="text-xl font-bold">CARSTAT</div>
        <nav className="space-x-6 text-sm">
          <a href="/" className="hover:underline">Home</a>
          <a href="/listings" className="hover:underline">Listings</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Contact</a>
          <button className="ml-4 px-4 py-1 border border-white rounded-full text-sm hover:bg-black hover:text-white">Sign in</button>
        </nav>
      </header>

      {/* Listing Title */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Listing v1</h1>
            <p className="text-sm text-gray-600">
              {loading ? "Loading..." : `Showing ${cars.length} result${cars.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div>
            <select className="border border-gray-300 rounded-md px-4 py-2 text-sm">
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car) => {
            let images: string[] = [];
            try {
              const parsed = typeof car.images === "string" ? JSON.parse(car.images) : car.images;
              if (Array.isArray(parsed)) images = parsed;
            } catch (e) {
              console.error("Failed to parse images", e);
            }

            const currentIndex = currentIndices[car.id] || 0;
            const imageUrl = images[currentIndex] || "/default-car.webp";

            return (
              <div key={car.id} className="bg-white p-4 rounded-xl shadow-md">
                <div className="relative w-full">
                  <Image
                    src={imageUrl}
                    alt="car"
                    width={300}
                    height={200}
                    className="rounded-lg object-cover w-full h-[180px]"
                  />

                  {/* Indicator pozitie */}
                  {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {currentIndex + 1} / {images.length}
                    </div>
                  )}

                  {/* Butoane navigare */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => prevImage(car.id)}
                        disabled={currentIndex === 0}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
                      >
                        ⬅
                      </button>
                      <button
                        onClick={() => nextImage(car.id, images.length)}
                        disabled={currentIndex === images.length - 1}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded"
                      >
                        ➡
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-lg">{car.title}</h3>
                  <p className="text-sm text-gray-600">{car.year} • {car.fuel_type} • {car.transmission}</p>
                  <p className="text-blue-600 font-semibold mt-1">€{car.price.toLocaleString()}</p>

                  <a
                    href={`/listings/${car.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-md text-sm mt-2 hover:bg-blue-700 transition"
                  >
                    View Details
                  </a>

                  {car.source_url && (
                    <a
                      href={car.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-black text-white text-center py-2 rounded-md text-sm mt-2 hover:bg-gray-800 transition"
                    >
                      🔗 View original ad
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-10 gap-2">
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-4 py-2 rounded-full border ${
                p === page ? "bg-gray-200" : ""
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
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
