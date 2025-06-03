"use client";

import { useState } from "react";
import Image from "next/image";
import { parseImages, formatNumber } from "@/utils/carUtils";
import { RatingBadge } from "./RatingBadge";
import { QualityScore } from "./QualityScore";
import {
    CalendarIcon,
    FuelIcon,
    GaugeIcon,
    TransmissionIcon,
    EngineIcon,
    SpeedometerIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@/components/Icons";

export interface CarData {
    id: number;
    title: string;
    brand?: string;
    model?: string;
    price: number;
    year: number;
    fuel_type: string;
    mileage: number;
    transmission: string;
    images: string[] | string;
    engine_capacity?: number;
    engine_power?: number;
    sold?: boolean;
    is_favorite?: boolean;
    deal_rating?: string;
    estimated_price?: number;
    quality_score?: number;
    suspicious_price?: boolean;
    location?: string;
    drive_type?: string;
    generation?: string;
    right_hand_drive?: boolean;
}

interface CarCardProps {
    car: CarData;
    variant?: string;
    onFavoriteToggle?: (car: CarData) => void;
    isUpdatingFavorite?: boolean;
    showImageNavigation?: boolean;
    showQualityScore?: boolean;
    showEstimatedPrice?: boolean;
    className?: string;
}

export const CarCard: React.FC<CarCardProps> = ({
    car,
    variant = "grid",
    onFavoriteToggle,
    isUpdatingFavorite = false,
    showImageNavigation = true,
    showQualityScore = true,
    showEstimatedPrice = true,
    className = ""
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = parseImages(car.images);
    const currentImage = images[currentImageIndex] || "/default-car.webp";

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1));
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onFavoriteToggle?.(car);
    };

    const FavoriteButton = () => (
        <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full ${car.is_favorite ? "bg-red-50" : "bg-gray-50"
                } backdrop-blur-sm shadow-md transition-all duration-300 ${isUpdatingFavorite ? "opacity-50 cursor-not-allowed" : "opacity-100"
                }`}
            disabled={isUpdatingFavorite}
        >
            {isUpdatingFavorite ? (
                <div className="w-5 h-5 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full" />
            ) : (
                <span className="text-2xl">{car.is_favorite ? "❤️" : "🤍"}</span>
            )}
        </button>
    );

    const ImageGallery = ({ height = "h-[220px]" }) => {
        const [imageLoading, setImageLoading] = useState(true);
        const [imageError, setImageError] = useState(false);

        return (
            <div className={`relative ${height} w-full overflow-hidden bg-gray-100`}>
                {/* Loading placeholder */}
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}

                {/* Error placeholder */}
                {imageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 z-10">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Image unavailable</span>
                    </div>
                )}

                <Image
                    src={currentImage}
                    alt={car.title}
                    fill
                    className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                    sizes={variant === "list" ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 50vw"}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                    }}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />

                {onFavoriteToggle && <FavoriteButton />}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md z-20">
                        {currentImageIndex + 1} / {images.length}
                    </div>
                )}

                {/* Navigation Arrows */}
                {showImageNavigation && images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            disabled={currentImageIndex === 0}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-30 z-20"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            disabled={currentImageIndex === images.length - 1}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-30 z-20"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </>
                )}

                {/* Status Badges */}
                {car.sold && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-md font-medium z-20">
                        Sold
                    </div>
                )}

                {car.deal_rating && !car.sold && variant !== "home" && (
                    <RatingBadge
                        rating={car.deal_rating}
                        className="absolute bottom-3 left-3 z-20"
                    />
                )}
            </div>
        );
    };

    const CarDetails = ({ showFullDetails = true }) => (
        <div className={`grid ${showFullDetails ? 'grid-cols-2' : 'grid-cols-1'} gap-y-2 text-sm text-gray-600 mb-3`}>
            <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                <span>{car.year}</span>
            </div>
            <div className="flex items-center">
                <FuelIcon className="w-4 h-4 mr-1.5" />
                <span>{car.fuel_type}</span>
            </div>
            <div className="flex items-center">
                <GaugeIcon className="w-4 h-4 mr-1.5" />
                <span>{formatNumber(car.mileage)} km</span>
            </div>
            <div className="flex items-center">
                <TransmissionIcon className="w-4 h-4 mr-1.5" />
                <span>{car.transmission}</span>
            </div>
            {showFullDetails && car.engine_capacity && (
                <div className="flex items-center">
                    <EngineIcon className="w-4 h-4 mr-1.5" />
                    <span>{formatNumber(car.engine_capacity)} cm³</span>
                </div>
            )}
            {showFullDetails && car.engine_power && (
                <div className="flex items-center">
                    <SpeedometerIcon className="w-4 h-4 mr-1.5" />
                    <span>{formatNumber(car.engine_power)} hp</span>
                </div>
            )}
        </div>
    );

    const PriceInfo = ({ textSize = "text-xl" }) => (
        <div className="flex flex-col">
            <div className={`${textSize} font-bold text-blue-600`}>
                €{formatNumber(car.price)}
            </div>
            {showEstimatedPrice && car.estimated_price && (
                <div className="text-sm text-gray-500">
                    Est: €{formatNumber(car.estimated_price)}
                </div>
            )}
            {car.location && variant !== "home" && (
                <div className="text-xs text-gray-400 mt-1">
                    📍 {car.location}
                </div>
            )}
        </div>
    );

    if (variant === "grid") {
        return (
            <div className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
                <a href={`/listings/${car.id}`} className="block">
                    <ImageGallery />
                    <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{car.title}</h3>
                        <CarDetails />
                        <div className="flex justify-between items-start">
                            <PriceInfo />
                            {showQualityScore && (
                                <QualityScore score={car.quality_score} size="md" />
                            )}
                        </div>
                        {car.suspicious_price && (
                            <div className="mt-2 flex items-center text-red-500">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-xs">Suspicious Price</span>
                            </div>
                        )}
                    </div>
                </a>
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}>
                <a href={`/listings/${car.id}`} className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 md:min-h-[200px]">
                        <ImageGallery height="h-[220px] md:h-[200px]" />
                    </div>
                    <div className="w-full md:w-2/3 p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{car.title}</h3>
                                {car.brand && car.model && (
                                    <p className="text-sm text-gray-500">{car.brand} {car.model}</p>
                                )}
                            </div>
                            <PriceInfo textSize="text-xl" />
                        </div>
                        <CarDetails showFullDetails={true} />
                        <div className="flex items-center justify-between">
                            {showQualityScore && (
                                <QualityScore score={car.quality_score} size="sm" />
                            )}
                        </div>
                        {car.suspicious_price && (
                            <div className="mt-2 flex items-center text-red-500">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-xs">Suspicious Price</span>
                            </div>
                        )}
                    </div>
                </a>
            </div>
        );
    }

    if (variant === "compact" || variant === "home") {
        return (
            <div className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${className}`}>
                <a href={`/listings/${car.id}`} className="block">
                    <ImageGallery height="h-48" />
                    <div className="p-4">
                        <h3 className="font-bold text-base text-gray-800 mb-2 line-clamp-1">{car.title}</h3>
                        <CarDetails showFullDetails={false} />
                        <div className="flex items-baseline justify-between">
                            <PriceInfo textSize="text-lg" />
                            {car.estimated_price && car.price < car.estimated_price && (
                                <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                    -{Math.round(((car.estimated_price - car.price) / car.estimated_price) * 100)}%
                                </div>
                            )}
                        </div>
                    </div>
                </a>
            </div>
        );
    }

    return null;
};
