"use client";

import { useTranslations } from 'next-intl';

interface RatingBadgeProps {
    rating: string | undefined;
    className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, className = "" }) => {
    const t = useTranslations('carCard.ratings');

    const getRatingInfo = (rating: string | undefined) => {
        switch (rating?.toUpperCase()) {
            case "S":
                return { label: t('exceptionalPrice'), color: "bg-green-700", textColor: "text-white" };
            case "A":
                return { label: t('veryGoodPrice'), color: "bg-lime-600", textColor: "text-white" };
            case "B":
                return { label: t('goodPrice'), color: "bg-emerald-500", textColor: "text-white" };
            case "C":
                return { label: t('fairPrice'), color: "bg-yellow-400", textColor: "text-black" };
            case "D":
                return { label: t('expensive'), color: "bg-orange-500", textColor: "text-white" };
            case "E":
                return { label: t('veryExpensive'), color: "bg-rose-500", textColor: "text-white" };
            case "F":
                return { label: t('overpriced'), color: "bg-red-700", textColor: "text-white" };
            default:
                return null;
        }
    };

    const ratingInfo = getRatingInfo(rating);

    if (!ratingInfo) return null;

    return (
        <div className={`px-3 py-1 rounded-md text-xs font-semibold ${ratingInfo.color} ${ratingInfo.textColor} ${className}`}>
            {ratingInfo.label}
        </div>
    );
};