"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);


type Deal = {
  id: number;
  title: string;
  price: number;
  estimated_price: number;
  brand: string;
  model: string;
  images: string[] | string;
};

type LocationStat = {
  location: string;
  count: number;
};

type RatingStat = {
  rating: string;
  count: number;
};

const getRatingDetails = (rating: string) => {
  switch (rating.toUpperCase()) {
    case "S":
      return { label: "Exceptional Price", color: "#166534" };
    case "A":
      return { label: "Very Good Price", color: "#4d7c0f" };
    case "B":
      return { label: "Good Price", color: "#059669" };
    case "C":
      return { label: "Fair Price", color: "#facc15" };
    case "D":
      return { label: "Expensive", color: "#f97316" };
    case "E":
      return { label: "Very Expensive", color: "#f43f5e" };
    case "F":
      return { label: "Overpriced", color: "#b91c1c" };
    default:
      return { label: "Unknown", color: "#d1d5db" };
  }
};

export default function Dashboard() {
  const [topDeals, setTopDeals] = useState<Deal[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStat[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStat[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/analytics/top-deals")
      .then((res) => res.json())
      .then((data) => setTopDeals(data));

    fetch("http://localhost:8000/analytics/deal-rating-distribution")
      .then((res) => res.json())
      .then((data) => setRatingStats(data));

    fetch("http://localhost:8000/analytics/top-locations")
      .then((res) => res.json())
      .then((data) => setLocationStats(data));
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
    <main className="min-h-screen bg-white text-black">
      <Navbar />

      <section className="py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Top 5 Exceptional Deals</h2>
          <ul className="space-y-4">
            {topDeals.map((car) => (
              <li key={car.id} className="flex gap-4 items-center border-b pb-4">
                <img
                  src={parseImage(car.images)}
                  alt={car.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <a href={`/listings/${car.id}`} className="text-sm font-semibold hover:underline">
                    {car.title}
                  </a>
                  <p className="text-xs text-gray-500">
                    Est. Price: €{car.estimated_price.toLocaleString()}
                  </p>
                  <p className="text-blue-600 font-bold text-sm">
                    €{car.price.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white shadow rounded-xl p-6 max-w-[500px] mx-auto">
          <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
          {ratingStats.length === 0 ? (
            <p className="text-sm text-gray-500">No data available.</p>
          ) : (
            <Pie
              data={{
                labels: ratingStats.map((stat) => getRatingDetails(stat.rating).label),
                datasets: [
                  {
                    data: ratingStats.map((stat) => stat.count),
                    backgroundColor: ratingStats.map((stat) => getRatingDetails(stat.rating).color),
                    borderColor: "#fff",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#111",
                      boxWidth: 12,
                      font: { size: 13 },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || "";
                        const value = context.raw as number;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} cars (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          )}
        </div>

        <div className="bg-white shadow rounded-xl p-6 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Top 5 Listing Locations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {locationStats.map((loc, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-100 rounded-md text-center shadow-sm"
              >
                <h3 className="text-sm font-medium">{loc.location}</h3>
                <p className="text-lg text-blue-600 font-bold">{loc.count} cars</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
