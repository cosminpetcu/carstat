"use client";

import Image from "next/image";
import SearchBox from "@/components/SearchBox";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandsSection from "@/components/BrandsSection";

type Car = {
  id: number;
  title: string;
  year: number;
  fuel_type: string;
  transmission: string;
  price: number;
  images: string[] | string;
  estimated_price?: number;
  deal_rating?: string;
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      {/* Hero section */}
      <div className="relative h-[110vh] bg-cover bg-center" style={{ backgroundImage: "url('/car-hero.jpg')" }}>
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-20 h-full w-full flex flex-col-reverse md:flex-row justify-between items-center gap-12 pt-5 px-6 max-w-7xl mx-auto">
          <div className="w-full md:w-1/2">
            <SearchBox />
          </div>
          <h1 className="text-white text-5xl font-bold text-center md:text-left w-full md:w-1/2">Find Your Perfect Car</h1>
        </div>
      </div>

      <BrandsSection />

      {/* Listings */}
      <section className="bg-gray-100 py-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Explore All Vehicles</h2>
          <a
            href="/listings"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            View All Listings
          </a>
        </div>

        <HomeListings />
      </section>

      {/* Why Choose Us */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-semibold text-center mb-8">Why Choose Us?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            "Special Financing Offers",
            "Trusted Car Dealership",
            "Transparent Pricing",
            "Expert Car Service"
          ].map((text, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-3xl">🚗</div>
              <h3 className="font-semibold">{text}</h3>
              <p className="text-sm text-gray-600">
                Our stress-free finance department that can find financial solutions to save you money.
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

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

function HomeListings() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/cars?limit=5&page=1&deal_rating=S")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setCars(data.items);
        } else {
          console.error("Invalid response:", data);
        }
      })
      .catch((err) => console.error("Error fetching cars:", err));
  }, []);

  const parseImage = (images: string[] | string) => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      return parsed?.[0] || "/default-car.webp";
    } catch {
      return "/default-car.webp";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {cars.map((car) => (
        <a
          key={car.id}
          href={`/listings/${car.id}`}
          className="bg-white p-4 rounded-xl shadow flex flex-col items-center hover:shadow-md transition"
        >
          <Image
            src={parseImage(car.images)}
            alt={car.title}
            width={300}
            height={200}
            className="rounded-lg object-cover w-full h-[180px]"
          />
          <div className="mt-2 text-center">
            <h3 className="font-semibold">{car.title}</h3>
            <p className="text-sm text-black">
              {car.year} • {car.fuel_type} • {car.transmission}
            </p>
            <p className="text-blue-600 font-semibold mt-1">
              €{car.price.toLocaleString()}
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
      ))}
    </div>
  );
}
