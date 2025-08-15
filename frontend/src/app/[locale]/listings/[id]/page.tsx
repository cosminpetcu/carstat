"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
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
import { CarCard, type CarData } from "@/components/ui/CarCard";
import { getQualityScoreColor, getQualityScoreLabel } from '@/utils/ratingUtils'
import { useFavorites } from '@/hooks/useFavorites';
import { PageLoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useTranslations } from 'next-intl';
import IntlProvider from '@/components/IntlProvider';

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

interface PriceHistoryItem {
  date: string;
  price: number;
}

interface PriceChangeItem {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

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

function CarDetailContent() {
  const t = useTranslations('carDetailPage');
  const { id } = useParams();
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
  const visibleCars = 4;

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const formatAdAge = (dateString: string | undefined) => {
    if (!dateString) return t('na');
    const adDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - adDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('timeAgo.today');
    if (diffDays === 1) return t('timeAgo.yesterday');
    if (diffDays < 7) return t('timeAgo.daysAgo', { count: diffDays });
    if (diffDays < 30) return t('timeAgo.weeksAgo', { count: Math.floor(diffDays / 7) });
    if (diffDays < 365) return t('timeAgo.monthsAgo', { count: Math.floor(diffDays / 30) });
    return t('timeAgo.yearsAgo', { count: Math.floor(diffDays / 365) });
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

  // useEffect(() => {
  //   if (showModelStats && car?.brand && car?.model) {
  //     fetch(`http://localhost:8000/cars/model-stats?brand=${car.brand}&model=${car.model}`)
  //       .then(res => res.json())
  //       .then(data => {
  //         setModelStats(data);
  //       })
  //       .catch(err => {
  //         console.error("Failed to fetch model statistics:", err);
  //       });
  //   }
  // }, [showModelStats, car?.brand, car?.model]);


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

  const { toggleFavorite, isUpdatingFavorite } = useFavorites(
    (carId, newState) => {
      setCar((prevCar) => prevCar ? { ...prevCar, is_favorite: newState } : null);
    },
    (error) => {
      console.error("Favorite toggle error:", error);
    }
  );

  if (loading || !car) return <PageLoadingSkeleton />;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return t('na');
    return new Date(dateString).toLocaleDateString();
  };

  const renderInfoItem = (label: string, value: string | number | boolean | undefined) => (
    <div className="p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-800 text-sm block mb-1">{label}</span>
      <span className="font-medium">{value ?? t('na')}</span>
    </div>
  );

  const nextSimilarCarsPage = () => {
    const maxPage = Math.ceil(similarCars.length / visibleCars) - 1;
    setSimilarCarsPage(prev => Math.min(prev + 1, maxPage));
  };

  const prevSimilarCarsPage = () => {
    setSimilarCarsPage(prev => Math.max(prev - 1, 0));
  };

  const MainImageGallery = ({ images, currentIndex, setCurrentIndex, openImageModal }: MainImageGalleryProps) => {
    if (!images || images.length === 0) {
      return (
        <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-800 mb-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{t('noImagesAvailable')}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-[500px] mb-8 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={images[currentIndex]}
          alt={t('carImageAlt')}
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
              aria-label={t('viewImageAriaLabel', { index: idx + 1 })}
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
          aria-label={t('previousImageAriaLabel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev: number) => (prev === images.length - 1 ? 0 : prev + 1));
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label={t('nextImageAriaLabel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
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
          aria-label={t('closeImageModalAriaLabel')}
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
            alt={t('carImageAlt')}
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
                aria-label={t('previousImageAriaLabel')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setModalImageIndex((prev: number) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 z-50 bg-black/30 hover:bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                aria-label={t('nextImageAriaLabel')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
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
                    aria-label={t('viewImageAriaLabel', { index: idx + 1 })}
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
          <span className="text-gray-500">{t('breadcrumb.cars')}</span>
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
                    <p className="text-sm">{t('suspiciousPrice.warning')} {t('suspiciousPrice.description')}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl text-gray-800 font-bold mb-1">{car.title}</h1>
                <div className="flex items-center text-black gap-2">
                  <span>{car.year ?? t('na')}</span>
                  <span>•</span>
                  <span>{car.mileage?.toLocaleString() ?? t('na')} {t('units.km')}</span>
                  <span>•</span>
                  <span>{car.fuel_type ?? t('na')}</span>
                  <span>•</span>
                  <span>{car.transmission ?? t('na')}</span>
                </div>
              </div>
              <button
                onClick={() => car && car.year !== undefined && toggleFavorite(car as CarData)}
                className={`p-2 rounded-full ${car.is_favorite ? "bg-red-50" : "bg-gray-50"} ${isUpdatingFavorite(car.id) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={isUpdatingFavorite(car.id)}
                aria-label={car.is_favorite ? t('removeFavoriteAriaLabel') : t('addFavoriteAriaLabel')}
              >
                {isUpdatingFavorite(car.id) ? (
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{t('noImagesAvailable')}</span>
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
              >
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  {t('technicalSpecifications')}
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

              {showTechnical && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {renderInfoItem(t('specs.year'), car.year ?? t('na'))}
                  {renderInfoItem(t('specs.mileage'), car.mileage ? `${car.mileage.toLocaleString()} ${t('units.km')}` : t('na'))}
                  {renderInfoItem(t('specs.fuelType'), car.fuel_type)}
                  {renderInfoItem(t('specs.transmission'), car.transmission)}
                  {renderInfoItem(t('specs.engineCapacity'), car.engine_capacity ? `${car.engine_capacity} ${t('units.cc')}` : t('na'))}
                  {renderInfoItem(t('specs.power'), car.engine_power ? `${car.engine_power} ${t('units.hp')}` : t('na'))}
                  {renderInfoItem(t('specs.emissionStandard'), car.emission_standard)}
                  {renderInfoItem(t('specs.consumptionCity'), car.consumption_city)}
                  {renderInfoItem(t('specs.consumptionHighway'), car.consumption_highway)}
                  {renderInfoItem(t('specs.consumptionMixed'), car.consumption_mixed)}
                  {car.battery_capacity && renderInfoItem(t('specs.batteryCapacity'), `${car.battery_capacity} kWh`)}
                  {car.range_km && renderInfoItem(t('specs.range'), `${car.range_km} ${t('units.km')}`)}
                </div>
              )}
            </div>

            {/* Physical Features */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <button
                onClick={() => setShowPhysical(!showPhysical)}
                className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
              >
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {t('physicalSpecifications')}
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
                  {car.color && renderInfoItem(t('specs.color'), car.color)}
                  {car.color_type && renderInfoItem(t('specs.colorType'), car.color_type)}
                  {car.doors && renderInfoItem(t('specs.doors'), car.doors)}
                  {car.nr_seats && renderInfoItem(t('specs.seats'), car.nr_seats)}
                  {car.version && renderInfoItem(t('specs.version'), car.version)}
                  {car.generation && renderInfoItem(t('specs.generation'), car.generation)}
                  {car.vehicle_condition && renderInfoItem(t('specs.condition'), car.vehicle_condition)}
                  {car.right_hand_drive !== null && renderInfoItem(t('specs.rightHandDrive'), car.right_hand_drive ? t('yes') : t('no'))}
                </div>
              )}
            </div>

            {/* Administrative Information */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="w-full flex items-center justify-between p-4 text-left border-b focus:outline-none"
              >
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {t('administrativeDetails')}
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
                  {car.vin && renderInfoItem(t('specs.vin'), car.vin)}
                  {car.itp_valid_until && renderInfoItem(t('specs.itpValidUntil'), formatDate(car.itp_valid_until))}
                  {car.seller_type && renderInfoItem(t('specs.sellerType'), car.seller_type)}
                  {car.origin_country && renderInfoItem(t('specs.originCountry'), car.origin_country)}
                  {car.first_owner !== null && renderInfoItem(t('specs.firstOwner'), car.first_owner ? t('yes') : t('no'))}
                  {car.no_accident !== null && renderInfoItem(t('specs.noAccident'), car.no_accident ? t('yes') : t('no'))}
                  {car.service_book !== null && renderInfoItem(t('specs.serviceBook'), car.service_book ? t('yes') : t('no'))}
                  {car.registered !== null && renderInfoItem(t('specs.registered'), car.registered ? t('yes') : t('no'))}
                  {car.created_at && renderInfoItem(t('specs.adCreatedAt'), formatDate(car.created_at))}
                  {car.sold && car.sold_detected_at && renderInfoItem(t('specs.soldDate'), formatDate(car.sold_detected_at))}
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    {t('description')}
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
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    {t('priceHistory')}
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

                    if (!Array.isArray(parsed)) return <p className="p-4 text-black">{t('noPriceHistoryAvailable')}</p>;

                    parsed = parsed.map((p: PriceHistoryItem) => {
                      const date = new Date(p.date);
                      const formattedDate = date.toLocaleDateString('en-GB');
                      return { ...p, date: formattedDate };
                    });

                    if (car.created_at && car.price) {
                      const formattedDate = new Date(car.created_at).toLocaleDateString("en-GB");
                      if (!parsed.find((p: PriceHistoryItem) => p.date === formattedDate)) {
                        parsed.unshift({
                          date: formattedDate,
                          price: car.price,
                        });
                      }
                    }

                    if (parsed.length === 0) return <p className="p-4 text-black">{t('noPriceHistoryAvailable')}</p>;

                    parsed.sort((a: PriceHistoryItem, b: PriceHistoryItem) => {
                      const dateA = a.date.split('/').reverse().join('');
                      const dateB = b.date.split('/').reverse().join('');
                      return dateA.localeCompare(dateB);
                    });

                    const prices = parsed.map((p: PriceHistoryItem) => p.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);

                    const range = maxPrice - minPrice;
                    const padding = range * 0.2;
                    const yMin = Math.max(0, minPrice - padding);
                    const yMax = maxPrice + padding;

                    const priceChanges = parsed.map((item: PriceHistoryItem, index: number) => {
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
                          {priceChanges.map((item: PriceChangeItem, index: number) => {
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
                                  label={{ value: t('estimatedPrice'), position: "insideRight", fill: "#FF8C00" }}
                                />
                              )}
                              <Tooltip
                                labelStyle={{ fontWeight: "bold" }}
                                formatter={(value: number) => [`€${value}`, t('price')]}
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
                  } catch {
                    return <p className="p-4 text-red-500">{t('failedToParsePriceHistory')}</p>;
                  }
                })()}
              </div>
            )}

            {/* Model Statistics Card */}
            {/* <div className="bg-white rounded-xl border shadow-sm mb-6">
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
                  {t('modelStatistics')}
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
                      <p className="mt-2 text-gray-600">{t('loadingModelStats')}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-medium mb-4">{t('priceDistributionFor')} {car?.brand} {car?.model}</h3>
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
                                formatter={(value) => [`${value} ${t('cars')}`, t('count')]}
                                labelFormatter={(value) => `${t('priceRange')}: ${value}`}
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

                      <div>
                        <h3 className="text-lg font-medium mb-4">{t('keyStatistics')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{t('marketDemand')}</div>
                            <div className="text-xl font-semibold text-gray-800">
                              {modelStats.avgSaleTime != null ?
                                (modelStats.avgSaleTime < 14 ?
                                  (modelStats.avgSaleTime < 7 ? t('high') : t('medium'))
                                  : t('low'))
                                : t('unknown')}
                            </div>
                            <div className="text-xs mt-1 text-gray-500">
                              {modelStats.avgSaleTime != null ?
                                t('basedOnDaysToSell', { days: modelStats.avgSaleTime }) :
                                t('insufficientSaleData')}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{t('modelStats.averageMileage')}</div>
                            <div className="text-xl font-semibold text-gray-800">{Math.round(modelStats.averageMileage || 0)} {t('units.km')}</div>
                            {car?.mileage && (
                              <div className={`text-xs mt-1 ${car.mileage < (modelStats.averageMileage || 0) ? "text-green-600" : "text-red-600"}`}>
                                {car.mileage < (modelStats.averageMileage || 0) ?
                                  t('belowAverage', { amount: Math.round((modelStats.averageMileage || 0) - car.mileage) }) :
                                  t('aboveAverage', { amount: Math.round(car.mileage - (modelStats.averageMileage || 0)) })}
                              </div>
                            )}
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{t('count')}</div>
                            <div className="text-xl font-semibold text-gray-800">{modelStats.totalCount || 0} {t('cars')}</div>
                            <div className="text-xs mt-1 text-gray-500">{t('inDatabase')}</div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{t('modelStats.averageYear')}</div>
                            <div className="text-xl font-semibold text-gray-800">{modelStats.averageYear || 0}</div>
                            {car?.year && (
                              <div className={`text-xs mt-1 ${car.year > (modelStats.averageYear || 0) ? "text-green-600" : "text-red-600"}`}>
                                {car.year > (modelStats.averageYear || 0) ?
                                  t('yearsNewer', { years: car.year - (modelStats.averageYear || 0) }) :
                                  t('yearsOlder', { years: (modelStats.averageYear || 0) - car.year })}
                              </div>
                            )}
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{t('soldCars')}</div>
                            <div className="text-xl font-semibold text-gray-800">{modelStats.soldCount || 0}</div>
                            <div className="text-xs mt-1 text-gray-500">
                              {modelStats.soldCount && modelStats.totalCount ?
                                t('percentOfTotal', { percent: Math.round((modelStats.soldCount / modelStats.totalCount) * 100) }) :
                                t('noData')}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{t('avgTimeToSell')}</div>
                            <div className="text-xl font-semibold text-gray-800">
                              {modelStats.avgSaleTime ? t('daysValue', { days: modelStats.avgSaleTime }) : t('na')}
                            </div>
                            <div className="text-xs mt-1 text-gray-500">{t('fromListingToSale')}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">{t('yearDistribution')}</h3>
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
                                formatter={(value) => [`${value} ${t('cars')}`, t('count')]}
                                labelFormatter={(value) => `${t('year')}: ${value}`}
                              />
                              {car?.year && (
                                <ReferenceLine
                                  x={car.year}
                                  stroke="#FF8C00"
                                  strokeDasharray="3 3"
                                  label={{
                                    value: t('thisCar'),
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
            </div> */}

            {/* Location */}
            <div className="bg-white rounded-xl border shadow-sm mb-6">
              <div className="p-4 border-b">
                <span className="flex items-center gap-2 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {t('location')}
                </span>
              </div>
              <div className="p-6">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-800">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-lg font-medium text-gray-800">{car.location || t('unknown')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Cars Section */}
            {similarCars.length > 0 && (
              <div className="bg-white shadow rounded-xl p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{t('similarCars')}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={prevSimilarCarsPage}
                      disabled={similarCarsPage === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={t('previousImageAriaLabel')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSimilarCarsPage}
                      disabled={similarCarsPage >= Math.ceil(similarCars.length / visibleCars) - 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={t('nextImageAriaLabel')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {loadingSimilar ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {similarCars
                      .slice(similarCarsPage * visibleCars, similarCarsPage * visibleCars + visibleCars)
                      .map(similarCar => (
                        <CarCard
                          key={similarCar.id}
                          car={similarCar as CarData}
                          variant="compact"
                          showImageNavigation={false}
                          showQualityScore={false}
                          showEstimatedPrice={true}
                        />
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
                    €{car.price?.toLocaleString() ?? t('na')}
                  </span>
                  <div className="flex items-center">
                    {car.deal_rating && (
                      <div className={`ml-2 px-3 py-1 rounded-md text-xs font-semibold ${car.deal_rating === "S" ? "bg-green-700 text-white" :
                        car.deal_rating === "A" ? "bg-lime-600 text-white" :
                          car.deal_rating === "B" ? "bg-emerald-500 text-white" :
                            car.deal_rating === "C" ? "bg-yellow-400 text-black" :
                              car.deal_rating === "D" ? "bg-orange-500 text-white" :
                                car.deal_rating === "E" ? "bg-rose-500 text-white" :
                                  car.deal_rating === "F" ? "bg-red-700 text-white" :
                                    "bg-gray-400 text-white"
                        }`}>
                        {t(`dealRating.${car.deal_rating.toLowerCase()}`)}
                      </div>
                    )}
                    {car.sold && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        {t('sold')}
                      </span>
                    )}
                  </div>
                </div>
                {car.estimated_price && (
                  <div className="text-sm text-gray-800 flex items-center">
                    <span>{t('estimatedValue')}: </span>
                    <span className="font-medium ml-1">€{car.estimated_price.toLocaleString()}</span>
                    {car.price && car.estimated_price && (
                      <span className={`ml-2 text-xs ${car.price > car.estimated_price ? "text-red-600" : "text-green-600"} font-medium rounded-full px-2 py-0.5 ${car.price > car.estimated_price ? "bg-red-50" : "bg-green-50"}`}>
                        {car.price > car.estimated_price ?
                          t('aboveMarket', { percent: (((car.price - car.estimated_price) / car.estimated_price) * 100).toFixed(1) }) :
                          t('belowMarket', { percent: (((car.estimated_price - car.price) / car.estimated_price) * 100).toFixed(1) })
                        }
                      </span>
                    )}
                  </div>
                )}
                {!car.sold && car.created_at && (
                  <div className="text-sm text-gray-500 mt-1">
                    {t('listed')}: {formatAdAge(car.created_at)}
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
                      {t('viewOriginalAd')}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Car Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium">{t('quickOverview')}</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {renderInfoItem(t('specs.year'), car.year ?? t('na'))}
                {renderInfoItem(t('specs.mileage'), car.mileage ? `${car.mileage.toLocaleString()} ${t('units.km')}` : t('na'))}
                {renderInfoItem(t('specs.fuelType'), car.fuel_type)}
                {renderInfoItem(t('specs.transmission'), car.transmission)}
                {renderInfoItem(t('specs.engineCapacity'), car.engine_capacity ? `${car.engine_capacity} ${t('units.cc')}` : t('na'))}
                {renderInfoItem(t('specs.power'), car.engine_power ? `${car.engine_power} ${t('units.hp')}` : t('na'))}
                {car.quality_score !== undefined && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">{t('qualityScore')}</h4>
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getQualityScoreColor(car.quality_score)}`}>
                        {car.quality_score}
                      </div>
                      <div className="ml-3">
                        <span className="text-sm font-medium">{getQualityScoreLabel(car.quality_score)}</span>
                        <p className="text-xs text-gray-500">{t('vehicleConditionAssessment')}</p>
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

export default function CarDetailPage() {
  return (
    <IntlProvider>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<PageLoadingSkeleton />}>
          <CarDetailContent />
        </Suspense>
      </div>
    </IntlProvider>
  );
}