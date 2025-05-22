"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { PendingActionsManager, getCurrentUrlForReturn } from '@/utils/pendingActions';

type Car = {
  id: number;
  title: string;
  brand: string;
  model: string;
  price: number;
  year?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  engine_power?: number;
  emission_standard?: string;
  doors?: number;
  nr_seats?: number;
  color?: string;
  color_type?: string;
  traction?: string;
  drive_type?: string;
  vehicle_condition?: string;
  itp_valid_until?: string;
  vin?: string;
  location?: string;
  engine_capacity?: number;
  seller_type?: string;
  version?: string;
  generation?: string;
  emissions?: string;
  consumption_city?: string;
  consumption_highway?: string;
  origin_country?: string;
  right_hand_drive?: boolean;
  first_owner?: boolean;
  no_accident?: boolean;
  service_book?: boolean;
  registered?: boolean;
  created_at: string;
  sold?: boolean;
  source_url?: string;
  is_favorite?: boolean;
  images?: string[] | string;
  description?: string;
  price_history?: string;
  quality_score?: number;
  suspicious_price?: boolean;
  sold_detected_at?: string;
  battery_capacity?: number;
  range_km?: number;
  consumption_mixed?: string;
  deal_rating?: string;
  estimated_price?: number;
};

interface ModelStats {
  totalCount: number;
  averagePrice: number;
  averageMileage: number;
  averageYear: number;
  soldCount: number;
  avgSaleTime: number | null;
  priceDistribution: {
    range: string;
    count: number;
    minPrice: number;
    maxPrice: number;
  }[];
  yearDistribution: {
    year: number;
    count: number;
  }[];
  fuelTypeDistribution: {
    type: string;
    count: number;
  }[];
  transmissionDistribution: {
    type: string;
    count: number;
  }[];
}

interface CustomTooltipPayload {
  payload?: {
    percent?: number;
    type?: string;
  };
  percent?: number;
  name?: string;
  value?: number;
  type?: string;
}

interface MainImageGalleryProps {
  images: string[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  openImageModal: (index: number) => void;
}

interface ImageModalProps {
  images: string[];
  modalImageIndex: number;
  setModalImageIndex: React.Dispatch<React.SetStateAction<number>>;
  closeImageModal: () => void;
}

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showTechnical, setShowTechnical] = useState(true);
  const [showPhysical, setShowPhysical] = useState(true);
  const [showAdmin, setShowAdmin] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(true);

  const [showModelStats, setShowModelStats] = useState(false);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);

  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [similarCarsPage, setSimilarCarsPage] = useState(0);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const visibleCars = 4;

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const getQualityScoreColor = (score: number | undefined) => {
    if (!score) return "bg-gray-300";
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-green-400 text-white";
    if (score >= 40) return "bg-yellow-400 text-black";
    if (score >= 20) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getQualityScoreLabel = (score: number | undefined) => {
    if (!score) return "Unrated";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Below Average";
    return "Poor";
  };

  const formatAdAge = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const adDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - adDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const parseImage = (images: string[] | string): string => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : "/default-car.webp";
    } catch {
      return "/default-car.webp";
    }
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
  if (showModelStats && car?.brand && car?.model) {
    fetch(`http://localhost:8000/cars/model-stats?brand=${car.brand}&model=${car.model}`)
      .then(res => res.json())
      .then(data => {
        setModelStats(data);
      })
      .catch(err => {
        console.error("Failed to fetch model statistics:", err);
      });
  }
}, [showModelStats, car?.brand, car?.model]);


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
        if (!token) data.is_favorite = false;
        setCar(data);

        try {
          const parsed = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
          if (Array.isArray(parsed)) setImages(parsed);
        } catch (err) {
          console.error("Failed to parse images", err);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch car", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (car?.id) {
      setLoadingSimilar(true);
      fetch(`http://localhost:8000/cars/${car.id}/similar`)
        .then(res => res.json())
        .then(data => {
          setSimilarCars(data);
          setLoadingSimilar(false);
        })
        .catch(err => {
          console.error("Failed to fetch similar cars", err);
          setLoadingSimilar(false);
        });
    }
  }, [car?.id]);

  const toggleFavorite = async () => {
    if (!car) return;
    
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      const currentUrl = getCurrentUrlForReturn();
      const actionType = car.is_favorite ? 'remove' : 'add';
      
      PendingActionsManager.saveFavoriteAction(car.id, actionType, currentUrl);
      
      window.location.href = '/login';
      return;
    }

    let user;
    try {
      user = JSON.parse(userRaw);
      if (!user.id) throw new Error("Invalid user object");
    } catch (err) {
      console.error("User object invalid:", err);
      
      const currentUrl = getCurrentUrlForReturn();
      const actionType = car.is_favorite ? 'remove' : 'add';
      
      PendingActionsManager.saveFavoriteAction(car.id, actionType, currentUrl);
      window.location.href = '/login';
      return;
    }

    setUpdatingFavorite(true);

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

      setCar((prevCar) => prevCar ? { ...prevCar, is_favorite: !prevCar.is_favorite } : null);
    } catch (err) {
      console.error("Favorite toggle failed", err);
    } finally {
      setUpdatingFavorite(false);
    }
  };

  if (loading || !car) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-600 text-lg">Loading...</div>
    </div>
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const renderInfoItem = (label: string, value: string | number | boolean | undefined) => (
    <div className="p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-800 text-sm block mb-1">{label}</span>
      <span className="font-medium">{value ?? "N/A"}</span>
    </div>
  );

  const nextSimilarCarsPage = () => {
    const maxPage = Math.ceil(similarCars.length / visibleCars) - 1;
    setSimilarCarsPage(prev => Math.min(prev + 1, maxPage));
  };

  const prevSimilarCarsPage = () => {
    setSimilarCarsPage(prev => Math.max(prev - 1, 0));
  };

  const getRatingColor = (rating: string | undefined) => {
    switch (rating?.toUpperCase()) {
      case "S": return "bg-green-700 text-white";
      case "A": return "bg-lime-600 text-white";
      case "B": return "bg-emerald-500 text-white";
      case "C": return "bg-yellow-400 text-black";
      case "D": return "bg-orange-500 text-white";
      case "E": return "bg-rose-500 text-white";
      case "F": return "bg-red-700 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const getRatingText = (rating: string | undefined) => {
    switch (rating?.toUpperCase()) {
      case "S": return "Exceptional Price";
      case "A": return "Very Good Price";
      case "B": return "Good Price";
      case "C": return "Fair Price";
      case "D": return "Expensive";
      case "E": return "Very Expensive";
      case "F": return "Overpriced";
      default: return "Unrated";
    }
  };

  const MainImageGallery = ({ images, currentIndex, setCurrentIndex, openImageModal }: MainImageGalleryProps) => {
    if (!images || images.length === 0) {
      return (
        <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-800 mb-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>No images available</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-[500px] mb-8 rounded-xl overflow-hidden shadow-lg">
        <Image 
          src={images[currentIndex]} 
          alt="Car image" 
          fill
          className="object-cover cursor-pointer"
          priority
          onClick={() => openImageModal(currentIndex)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              openImageModal(currentIndex);
            }
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, idx: number) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full ${currentIndex === idx ? "bg-white" : "bg-white/40"}`}
              aria-label={`View image ${idx + 1}`}
            />
          ))}
        </div>
        
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev: number) => (prev === images.length - 1 ? 0 : prev + 1));
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    );
  };

  const ImageModal = ({ images, modalImageIndex, setModalImageIndex, closeImageModal }: ImageModalProps) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeImageModal();
        } else if (e.key === 'ArrowLeft') {
          setModalImageIndex((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
        } else if (e.key === 'ArrowRight') {
          setModalImageIndex((prev: number) => (prev === images.length - 1 ? 0 : prev + 1));
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [closeImageModal, images, setModalImageIndex]);

    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        onClick={closeImageModal}
      >
        <button 
          onClick={closeImageModal}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div 
          className="relative w-full h-full max-w-screen-xl max-h-screen flex items-center justify-center"
          onClick={(e) => e.stopPropagation()} 
        >
          <Image
            src={images[modalImageIndex]}
            alt="Full size car image"
            fill
            className="object-contain"
            priority
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setModalImageIndex((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute left-4 z-50 bg-black/30 hover:bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setModalImageIndex((prev: number) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 z-50 bg-black/30 hover:bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, idx: number) => (
                  <button 
                    key={idx}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setModalImageIndex(idx);
                    }}
                    className={`w-3 h-3 rounded-full ${modalImageIndex === idx ? "bg-white" : "bg-white/40"}`}
                    aria-label={`View image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <Navbar />
      </div>
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-2 px-6 border-b">
        <div className="max-w-7xl mx-auto flex items-center text-sm">
          <span className="text-gray-500">Cars</span>
          <span className="mx-2">›</span>
          <span className="text-gray-500">{car.brand}</span>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">{car.model}</span>
        </div>
      </div>
      
      <section className="px-6 text-gray-700 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {car.suspicious_price && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">This listing has a suspicious price. It may be significantly below market value, have damages, or other pricing issues.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl text-gray-800 font-bold mb-1">{car.title}</h1>
                <div className="flex items-center text-black gap-2">
                  <span>{car.year ?? "N/A"}</span>
                  <span>•</span>
                  <span>{car.mileage?.toLocaleString() ?? "N/A"} km</span>
                  <span>•</span>
                  <span>{car.fuel_type ?? "N/A"}</span>
                  <span>•</span>
                  <span>{car.transmission ?? "N/A"}</span>
                </div>
              </div>
              <button 
                onClick={() => toggleFavorite()} 
                className={`p-2 rounded-full ${car.is_favorite ? "bg-red-50" : "bg-gray-50"} ${
                  updatingFavorite ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={updatingFavorite}
              >
                {updatingFavorite ? (
                  <div className="w-6 h-6 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                ) : (
                  <span className="text-2xl">{car.is_favorite ? "❤️" : "🤍"}</span>
                )}
              </button>
            </div>

            {/* Image Gallery */}
            {images.length > 0 ? (
              <MainImageGallery 
                images={images}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                openImageModal={openImageModal}
              />
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-800 mb-8">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>No images available</span>
                </div>
              </div>
            )}

            {/* Spec Sections */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <button 
                onClick={() => setShowTechnical(!showTechnical)} 
                className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
              >
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  Technical Specifications
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showTechnical ? "transform rotate-180" : ""}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {showAdmin && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {car.vin && renderInfoItem("VIN", car.vin)}
                  {car.itp_valid_until && renderInfoItem("ITP Valid Until", formatDate(car.itp_valid_until))}
                  {car.seller_type && renderInfoItem("Seller Type", car.seller_type)}
                  {car.origin_country && renderInfoItem("Origin Country", car.origin_country)}
                  {car.first_owner !== null && renderInfoItem("First Owner", car.first_owner ? "Yes" : "No")}
                  {car.no_accident !== null && renderInfoItem("No Accident", car.no_accident ? "Yes" : "No")}
                  {car.service_book !== null && renderInfoItem("Service Book", car.service_book ? "Yes" : "No")}
                  {car.registered !== null && renderInfoItem("Registered", car.registered ? "Yes" : "No")}
                  {car.created_at && renderInfoItem("Ad Created At", formatDate(car.created_at))}
                  {car.sold && car.sold_detected_at && renderInfoItem("Sold Date", formatDate(car.sold_detected_at))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <button 
                onClick={() => setShowPhysical(!showPhysical)} 
                className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
              >
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Physical Features
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showPhysical ? "transform rotate-180" : ""}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {showPhysical && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {car.color && renderInfoItem("Color", car.color)}
                  {car.color_type && renderInfoItem("Color Type", car.color_type)}
                  {car.doors && renderInfoItem("Doors", car.doors)}
                  {car.nr_seats && renderInfoItem("Seats", car.nr_seats)}
                  {car.version && renderInfoItem("Version", car.version)}
                  {car.generation && renderInfoItem("Generation", car.generation)}
                  {car.vehicle_condition && renderInfoItem("Vehicle Condition", car.vehicle_condition)}
                  {car.right_hand_drive !== null && renderInfoItem("Right-hand Drive", car.right_hand_drive ? "Yes" : "No")}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <button 
                onClick={() => setShowAdmin(!showAdmin)} 
                className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
              >
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Administrative Information
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showAdmin ? "transform rotate-180" : ""}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {showAdmin && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {car.vin && renderInfoItem("VIN", car.vin)}
                  {car.itp_valid_until && renderInfoItem("ITP Valid Until", formatDate(car.itp_valid_until))}
                  {car.seller_type && renderInfoItem("Seller Type", car.seller_type)}
                  {car.origin_country && renderInfoItem("Origin Country", car.origin_country)}
                  {car.first_owner !== null && renderInfoItem("First Owner", car.first_owner ? "Yes" : "No")}
                  {car.no_accident !== null && renderInfoItem("No Accident", car.no_accident ? "Yes" : "No")}
                  {car.service_book !== null && renderInfoItem("Service Book", car.service_book ? "Yes" : "No")}
                  {car.registered !== null && renderInfoItem("Registered", car.registered ? "Yes" : "No")}
                  {car.created_at && renderInfoItem("Ad Created At", formatDate(car.created_at))}
                  {car.sold && car.sold_detected_at && renderInfoItem("Sold Date", formatDate(car.sold_detected_at))}
                </div>
              )}
            </div>

            {/* Description */}
            {car.description && (
              <div className="bg-white rounded-xl border shadow-sm mb-6">
                <button 
                  onClick={() => setShowDescription(!showDescription)} 
                  className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    Description
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showDescription ? "transform rotate-180" : ""}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {showDescription && (
                  <div className="p-4">
                    <div className="prose max-w-none text-gray-800">
                      {(() => {
                        try {
                          const parsed = JSON.parse(car.description ?? "[]");
                          if (Array.isArray(parsed)) {
                            return parsed.map((line, idx) => <p key={idx}>{line}</p>);
                          }
                        } catch {
                          return <p>{car.description}</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price History */}
            {car.price_history && (
              <div className="bg-white rounded-xl border shadow-sm mb-6">
                <button 
                  onClick={() => setShowPriceHistory(!showPriceHistory)} 
                  className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Price History
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showPriceHistory ? "transform rotate-180" : ""}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {showPriceHistory && (() => {
                  try {
                    let parsed = JSON.parse(car.price_history || "[]");

                    if (!Array.isArray(parsed)) return <p className="p-4 text-black">No price history available.</p>;

                    parsed = parsed.map((p: any) => {
                      const date = new Date(p.date);
                      const formattedDate = date.toLocaleDateString('en-GB');
                      return { ...p, date: formattedDate };
                    });

                    if (car.created_at && car.price) {
                      const formattedDate = new Date(car.created_at).toLocaleDateString("en-GB");
                      if (!parsed.find((p: any) => p.date === formattedDate)) {
                        parsed.unshift({
                          date: formattedDate,
                          price: car.price,
                        });
                      }
                    }

                    if (parsed.length === 0) return <p className="p-4 text-black">No price history available.</p>;

                    parsed.sort((a: any, b: any) => {
                      const dateA = a.date.split('/').reverse().join('');
                      const dateB = b.date.split('/').reverse().join('');
                      return dateA.localeCompare(dateB);
                    });

                    const prices = parsed.map((p: any) => p.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    
                    const range = maxPrice - minPrice;
                    const padding = range * 0.2;
                    const yMin = Math.max(0, minPrice - padding);
                    const yMax = maxPrice + padding;

                    const priceChanges = parsed.map((item: any, index: number) => {
                      if (index === 0) return { ...item, change: 0, changePercent: 0 };
                      
                      const prevPrice = parsed[index - 1].price;
                      const change = item.price - prevPrice;
                      const changePercent = (change / prevPrice) * 100;
                      
                      return {
                        ...item,
                        change,
                        changePercent: parseFloat(changePercent.toFixed(2))
                      };
                    });

                    const referencePrice = car.estimated_price || null;

                    return (
                      <div className="p-4 space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {priceChanges.map((item: any, index: number) => {
                            if (index === 0) return null;
                            const isIncrease = item.change > 0;
                            const color = isIncrease ? "text-red-600" : "text-green-600";
                            const symbol = isIncrease ? "↑" : "↓";
                            
                            return (
                              <div key={index} className="text-sm bg-gray-50 px-3 py-2 rounded-md">
                                <span className="font-medium">{item.date}: </span>
                                <span className={color}>
                                  {symbol} €{Math.abs(item.change).toLocaleString()} ({item.changePercent}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="h-64 bg-white rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={parsed} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                stroke="#333" 
                              />
                              <YAxis 
                                stroke="#333" 
                                domain={[yMin, yMax]}
                                tickCount={5}
                                tickFormatter={(value) => `€${value}`}
                              />
                              {referencePrice && (
                                <ReferenceLine 
                                  y={referencePrice} 
                                  stroke="#FF8C00" 
                                  strokeDasharray="3 3" 
                                  label={{ value: "Est. Price", position: "insideRight", fill: "#FF8C00" }} 
                                />
                              )}
                              <Tooltip
                                labelStyle={{ fontWeight: "bold" }}
                                formatter={(value: any) => [`€${value}`, "Price"]}
                                contentStyle={{ backgroundColor: "white", borderRadius: "8px", padding: "8px", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                dot={{ r: 6, strokeWidth: 2, fill: "#fff" }} 
                                activeDot={{ r: 8 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  } catch (err) {
                    return <p className="p-4 text-red-500">Failed to parse price history.</p>;
                  }
                })()}
              </div>
            )}

            {/* Model Statistics Card */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <button 
                onClick={() => setShowModelStats(!showModelStats)} 
                className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
              >
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  Model Statistics
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showModelStats ? "transform rotate-180" : ""}`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {showModelStats && (
                <div className="p-6 space-y-6">
                  {!modelStats ? (
                    <div className="text-center">
                      <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                      <p className="mt-2 text-gray-600">Loading statistics...</p>
                    </div>
                  ) : (
                    <>
                      {/* Price Distribution Chart */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Price Distribution for {car?.brand} {car?.model}</h3>
                        <div className="h-64 bg-white rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={modelStats.priceDistribution || []} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="range" 
                                stroke="#333"
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 12 }}
                                height={70}
                              />
                              <YAxis 
                                stroke="#333"
                                tickFormatter={(value) => value}
                              />
                              <Tooltip
                                formatter={(value) => [`${value} cars`, "Count"]}
                                labelFormatter={(value) => `Price range: ${value}`}
                              />
                              <Bar 
                                dataKey="count" 
                                fill="#3b82f6" 
                                barSize={30}
                                radius={[4, 4, 0, 0]}
                              >
                                {(modelStats.priceDistribution || []).map((entry, index) => {
                                  const isCurrentCarRange = car?.price && car.price >= entry.minPrice && car.price <= entry.maxPrice;
                                  return (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={isCurrentCarRange ? "#10b981" : "#3b82f6"} 
                                    />
                                  );
                                })}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Key Statistics */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Key Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Market Demand</div>
                            <div className="text-xl font-semibold text-gray-800">
                              {modelStats.avgSaleTime != null ? 
                                (modelStats.avgSaleTime < 14 ? 
                                  (modelStats.avgSaleTime < 7 ? "High" : "Medium") 
                                  : "Low")
                                : "Unknown"}
                            </div>
                            <div className="text-xs mt-1 text-gray-500">
                              {modelStats.avgSaleTime != null ? 
                                `Based on ${modelStats.avgSaleTime} days to sell` : 
                                "Insufficient sale data"}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Average Mileage</div>
                            <div className="text-xl font-semibold text-gray-800">{Math.round(modelStats.averageMileage || 0)} km</div>
                            {car?.mileage && (
                              <div className={`text-xs mt-1 ${car.mileage < (modelStats.averageMileage || 0) ? "text-green-600" : "text-red-600"}`}>
                                {car.mileage < (modelStats.averageMileage || 0) ? 
                                  `${Math.round((modelStats.averageMileage || 0) - car.mileage)} km below avg` : 
                                  `${Math.round(car.mileage - (modelStats.averageMileage || 0))} km above avg`}
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Count</div>
                            <div className="text-xl font-semibold text-gray-800">{modelStats.totalCount || 0} cars</div>
                            <div className="text-xs mt-1 text-gray-500">in database</div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Average Year</div>
                            <div className="text-xl font-semibold text-gray-800">{modelStats.averageYear || 0}</div>
                            {car?.year && (
                              <div className={`text-xs mt-1 ${car.year > (modelStats.averageYear || 0) ? "text-green-600" : "text-red-600"}`}>
                                {car.year > (modelStats.averageYear || 0) ? 
                                  `${car.year - (modelStats.averageYear || 0)} years newer` : 
                                  `${(modelStats.averageYear || 0) - car.year} years older`}
                              </div>
                            )}
                          </div>
                          
                          {/* New Stat: Sold Cars */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Sold Cars</div>
                            <div className="text-xl font-semibold text-gray-800">{modelStats.soldCount || 0}</div>
                            <div className="text-xs mt-1 text-gray-500">
                              {modelStats.soldCount && modelStats.totalCount ? 
                                `${Math.round((modelStats.soldCount / modelStats.totalCount) * 100)}% of total` : 
                                'No data'}
                            </div>
                          </div>
                          
                          {/* New Stat: Average Sale Time */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Avg. Time to Sell</div>
                            <div className="text-xl font-semibold text-gray-800">
                              {modelStats.avgSaleTime ? `${modelStats.avgSaleTime} days` : 'N/A'}
                            </div>
                            <div className="text-xs mt-1 text-gray-500">from listing to sale</div>
                          </div>
                        </div>
                      </div>

                      {/* Year Distribution Chart */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Year Distribution</h3>
                        <div className="h-64 bg-white rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={modelStats.yearDistribution || []} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                              <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="year" 
                                stroke="#333"
                              />
                              <YAxis 
                                stroke="#333"
                                tickFormatter={(value) => value}
                              />
                              <Tooltip
                                formatter={(value) => [`${value} cars`, "Count"]}
                                labelFormatter={(value) => `Year: ${value}`}
                              />
                              {car?.year && (
                                <ReferenceLine 
                                  x={car.year} 
                                  stroke="#FF8C00" 
                                  strokeDasharray="3 3" 
                                  label={{ 
                                    value: "This Car", 
                                    position: "top", 
                                    fill: "#FF8C00",
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    offset: -10
                                  }} 
                                />
                              )}
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <div className="p-4 border-b">
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Location
                </span>
              </div>
              <div className="p-6">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-800">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-lg font-medium text-gray-800">{car.location || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Cars Section */}
            {similarCars.length > 0 && (
              <div className="bg-white shadow rounded-xl p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Similar Cars</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={prevSimilarCarsPage}
                      disabled={similarCarsPage === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                    <button
                      onClick={nextSimilarCarsPage}
                      disabled={similarCarsPage >= Math.ceil(similarCars.length / visibleCars) - 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {loadingSimilar ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {similarCars
                      .slice(similarCarsPage * visibleCars, similarCarsPage * visibleCars + visibleCars)
                      .map(similarCar => (
                        <a 
                          key={similarCar.id}
                          href={`/listings/${similarCar.id}`}
                          className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative h-40">
                            <Image
                              src={parseImage(similarCar.images || '')}
                              alt={similarCar.title}
                              fill
                              className="object-cover"
                            />
                            {similarCar.deal_rating && (
                              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-semibold ${getRatingColor(similarCar.deal_rating)}`}>
                                {similarCar.deal_rating}
                              </div>
                            )}
                            {similarCar.sold && (
                              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-md">
                                Sold
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-sm line-clamp-1">{similarCar.title}</h3>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 my-1">
                              <span>{similarCar.year}</span>
                              <span>•</span>
                              <span>{similarCar.mileage?.toLocaleString() || 'N/A'} km</span>
                              <span>•</span>
                              <span>{similarCar.fuel_type}</span>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                              <div>
                                <div className="text-lg font-bold text-blue-600">
                                  €{similarCar.price?.toLocaleString() || "N/A"}
                                </div>
                                {similarCar.estimated_price && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    Est: €{similarCar.estimated_price.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6 h-fit top-28">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-blue-50 p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xl font-bold text-blue-600">
                    €{car.price?.toLocaleString() ?? "N/A"}
                  </span>
                  <div className="flex items-center">
                    {car.deal_rating && (
                      <div className={`ml-2 px-3 py-1 rounded-md text-xs font-semibold ${
                        car.deal_rating === "S" ? "bg-green-700 text-white" : 
                        car.deal_rating === "A" ? "bg-lime-600 text-white" : 
                        car.deal_rating === "B" ? "bg-emerald-500 text-white" : 
                        car.deal_rating === "C" ? "bg-yellow-400 text-black" : 
                        car.deal_rating === "D" ? "bg-orange-500 text-white" : 
                        car.deal_rating === "E" ? "bg-rose-500 text-white" : 
                        car.deal_rating === "F" ? "bg-red-700 text-white" : 
                        "bg-gray-400 text-white"
                      }`}>
                        {car.deal_rating === "S" ? "Exceptional Price" : 
                        car.deal_rating === "A" ? "Very Good Price" : 
                        car.deal_rating === "B" ? "Good Price" : 
                        car.deal_rating === "C" ? "Fair Price" : 
                        car.deal_rating === "D" ? "Expensive" : 
                        car.deal_rating === "E" ? "Very Expensive" : 
                        car.deal_rating === "F" ? "Overpriced" : 
                        "Unrated"}
                      </div>
                    )}
                    {car.sold && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        SOLD
                      </span>
                    )}
                  </div>
                </div>
                {car.estimated_price && (
                  <div className="text-sm text-gray-800 flex items-center">
                    <span>Est. value: </span>
                    <span className="font-medium ml-1">€{car.estimated_price.toLocaleString()}</span>
                    {car.price && car.estimated_price && (
                      <span className={`ml-2 text-xs ${car.price > car.estimated_price ? "text-red-600" : "text-green-600"} font-medium rounded-full px-2 py-0.5 ${car.price > car.estimated_price ? "bg-red-50" : "bg-green-50"}`}>
                        {car.price > car.estimated_price ? 
                          `${(((car.price - car.estimated_price) / car.estimated_price) * 100).toFixed(1)}% above market` : 
                          `${(((car.estimated_price - car.price) / car.estimated_price) * 100).toFixed(1)}% below market`
                        }
                      </span>
                    )}
                  </div>
                )}
                {!car.sold && car.created_at && (
                      <div className="text-sm text-gray-500 mt-1">
                        Listed: {formatAdAge(car.created_at)}
                      </div>
                    )}
              </div>
              
              <div className="p-6">
                <div className="flex flex-col space-y-4">
                  {!car.sold && (
                    <a
                      href={car.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      View original ad
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Car Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">Quick Overview</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {renderInfoItem("Year", car.year ?? "N/A")}
                {renderInfoItem("Mileage", car.mileage ? `${car.mileage.toLocaleString()} km` : "N/A")}
                {renderInfoItem("Fuel Type", car.fuel_type)}
                {renderInfoItem("Transmission", car.transmission)}
                {renderInfoItem("Engine Capacity", car.engine_capacity ? `${car.engine_capacity} cc` : "N/A")}
                {renderInfoItem("Power", car.engine_power  ? `${car.engine_power} hp` : "N/A")}
                {car.quality_score !== undefined && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Quality Score</h4>
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getQualityScoreColor(car.quality_score)}`}>
                        {car.quality_score}
                      </div>
                      <div className="ml-3">
                        <span className="text-sm font-medium">{getQualityScoreLabel(car.quality_score)}</span>
                        <p className="text-xs text-gray-500">Vehicle condition assessment</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {showImageModal && (
        <ImageModal 
          images={images}
          modalImageIndex={modalImageIndex}
          setModalImageIndex={setModalImageIndex}
          closeImageModal={closeImageModal}
        />
      )}

      <Footer />
    </main>
    );
  }