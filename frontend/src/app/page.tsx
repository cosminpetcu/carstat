"use client";

import Image from "next/image";
import SearchBox from "@/components/SearchBox";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandsSection from "@/components/BrandsSection";
import { useRouter } from "next/navigation";
import { PendingActionsManager } from '@/utils/pendingActions';
import { getFirstImage } from "@/utils/carUtils";
import { RatingBadge } from "@/components/ui/RatingBadge";

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
  mileage?: number;
  engine_power?: number;
  engine_capacity?: number;
};

export default function Home() {
  const router = useRouter();

  const handleProtectedNavigation = (targetPath: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      PendingActionsManager.saveNavigationIntent(targetPath);
      window.location.href = '/login';
    } else {
      router.push(targetPath);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden">
      <Navbar />

      {/* Hero section with fixed spacing */}
      <div className="relative min-h-screen bg-gradient-to-b from-black/70 to-black/50">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/car-hero.jpg"
            alt="Hero car"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-black/60 z-10" />
        </div>

        {/* Content container with better spacing */}
        <div className="relative z-20 flex flex-col items-center justify-center px-6 pt-24 pb-16 md:pt-32 md:pb-24 min-h-[750px] max-w-7xl mx-auto">
          {/* Title and subtitle with more space */}
          <div className="text-center mb-12 md:mb-16 pt-10">
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect Car
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
              Browse thousands of vehicles from Romania with detailed specifications
              and market analysis. Your next car is just a search away.
            </p>
          </div>

          {/* Search box container */}
          <div className="w-full md:w-2/3 max-w-2xl mb-12 md:mb-20">
            <SearchBox />
          </div>

          {/* Quick stats container with increased margin from search box */}
          <div className="grid grid-cols-3 gap-8 mt-4 text-white text-center">
            <div className="space-y-1">
              <div className="text-3xl font-bold">100,000+</div>
              <div className="text-blue-200 text-sm">Total Cars</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">Live</div>
              <div className="text-blue-200 text-sm">Market Data</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">Romania</div>
              <div className="text-blue-200 text-sm">Nationwide</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator moved lower and with more space from stats */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 mt-12">
          <div className="animate-bounce bg-white/10 p-2 rounded-full backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Enhanced Brands Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <BrandsSection />
      </section>

      {/* Featured listings with enhanced design */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Top Vehicles</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover vehicles with exceptional value based on our market analysis.
              All listings are scraped live from OLX and Autovit platforms.
            </p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 font-medium">Showing Exceptional Deals Only</span>
            </div>
            <a
              href="/listings"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center gap-2">
                View All Listings
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>

          <HomeListings />
        </div>
      </section>

      {/* CarStat Features section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">CarStat Features</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our platform aggregates and analyzes car listings to provide you with
              valuable insights for making informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
                title: "Market Analysis",
                description: "Compare prices across thousands of similar vehicles to understand market trends.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                title: "Live Monitoring",
                description: "Real-time tracking of price changes and new listings from OLX and Autovit.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.247 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: "Saved Searches",
                description: "Save your favorite search criteria and get notified of new matching listings.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                ),
                title: "Easy Sharing",
                description: "Share interesting listings with friends and family directly from the platform.",
                color: "from-orange-500 to-orange-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Car?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Start exploring thousands of cars from across Romania with detailed market analysis
            and price comparisons. Make an informed decision with CarStat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/listings"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors transform hover:scale-105 shadow-lg"
            >
              Browse All Cars
            </a>
            <button
              onClick={() => handleProtectedNavigation('/get-estimation')}
              className="bg-blue-500 bg-opacity-50 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-lg font-medium hover:bg-opacity-70 transition-all transform hover:scale-105 shadow-lg cursor-pointer"
            >
              Get Price Estimation
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function HomeListings() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/cars?limit=5&page=1&deal_rating=S&sold=false")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setCars(data.items);
        } else {
          console.error("Invalid response:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cars:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-md animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {cars.map((car) => (
        <a
          key={car.id}
          href={`/listings/${car.id}`}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
        >
          <div className="relative">
            <div className="aspect-w-16 aspect-h-10 overflow-hidden">
              <Image
                src={getFirstImage(car.images)}
                alt={car.title}
                width={300}
                height={200}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <RatingBadge rating={car.deal_rating} className="absolute top-3 right-3 shadow-lg" />
          </div>

          <div className="p-5">
            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">{car.title}</h3>

            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
              <span className="px-2 py-1 bg-gray-100 rounded">{car.year}</span>
              <span className="px-2 py-1 bg-gray-100 rounded">{car.fuel_type}</span>
              <span className="px-2 py-1 bg-gray-100 rounded">{car.transmission}</span>
            </div>

            {car.mileage && car.engine_power && (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {car.mileage.toLocaleString()} km
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {car.engine_power} hp
                </div>
              </div>
            )}

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xl font-bold text-blue-600">
                  €{car.price.toLocaleString()}
                </div>
                {car.estimated_price && (
                  <div className="text-xs text-gray-500 line-through">
                    €{car.estimated_price.toLocaleString()}
                  </div>
                )}
              </div>

              {car.estimated_price && car.price < car.estimated_price && (
                <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  -{Math.round(((car.estimated_price - car.price) / car.estimated_price) * 100)}%
                </div>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}