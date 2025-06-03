import { getRatingInfo } from "@/utils/ratingUtils";

interface RatingBadgeProps {
    rating: string | undefined;
    className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, className = "" }) => {
    const ratingInfo = getRatingInfo(rating);

    if (!ratingInfo) return null;

    return (
        <div className={`px-3 py-1 rounded-md text-xs font-semibold ${ratingInfo.color} ${ratingInfo.textColor} ${className}`}>
            {ratingInfo.label}
        </div>
    );
};