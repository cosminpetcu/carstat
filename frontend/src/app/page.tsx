"use client";

import Image from "next/image";
import SearchBox from "@/components/SearchBox";
import { useEffect, useState } from "react";

type Car = {
  id: number;
  title: string;
  year: number;
  fuel_type: string;
  transmission: string;
  price: number;
  images: string[] | string;
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="absolute top-0 w-full flex items-center justify-between px-10 py-6 z-30 text-white">
        <div className="text-xl font-bold">CARSTAT</div>
        <nav className="space-x-6 text-sm">
          <a href="#" className="hover:underline">Home</a>
          <a href="/listings" className="hover:underline">Listings</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Contact</a>
          <button className="ml-4 px-4 py-1 border border-white rounded-full text-sm hover:bg-white hover:text-black">Sign in</button>
        </nav>
      </header>

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

      {/* Brands */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-semibold text-center mb-6">Explore Our Premium Brands</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          {["audi", "bmw", "ford", "mercedes", "peugeot", "volkswagen"].map((brand) => (
            <div key={brand} className="flex flex-col items-center w-[100px] h-[120px] bg-white rounded-xl shadow p-4">
              <Image src={`/${brand}.png`} alt={brand} width={50} height={50} />
              <span className="mt-2 capitalize text-black text-sm">{brand}</span>
            </div>
          ))}
        </div>
      </section>

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

function HomeListings() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/cars?limit=5&page=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setCars(data.items); // ✅ accesăm doar lista de anunțuri
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
          </div>
        </a>
      ))}
    </div>
  );
}