export interface RatingInfo {
    label: string;
    color: string;
    textColor: string;
}

export const getRatingInfo = (rating: string | undefined, t?: (key: string) => string): RatingInfo | null => {
    if (t) {
        switch (rating?.toUpperCase()) {
            case "S":
                return { label: t('carCard.ratings.exceptionalPrice'), color: "bg-green-700", textColor: "text-white" };
            case "A":
                return { label: t('carCard.ratings.veryGoodPrice'), color: "bg-lime-600", textColor: "text-white" };
            case "B":
                return { label: t('carCard.ratings.goodPrice'), color: "bg-emerald-500", textColor: "text-white" };
            case "C":
                return { label: t('carCard.ratings.fairPrice'), color: "bg-yellow-400", textColor: "text-black" };
            case "D":
                return { label: t('carCard.ratings.expensive'), color: "bg-orange-500", textColor: "text-white" };
            case "E":
                return { label: t('carCard.ratings.veryExpensive'), color: "bg-rose-500", textColor: "text-white" };
            case "F":
                return { label: t('carCard.ratings.overpriced'), color: "bg-red-700", textColor: "text-white" };
            default:
                return null;
        }
    } else {
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
    }
};

export const getQualityScoreColor = (score: number | undefined): string => {
    if (!score) return "bg-gray-300";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-400";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
};

export const getQualityScoreLabel = (score: number | undefined, t?: (key: string) => string) => {
    if (t) {
        if (!score) return t('carCard.qualityLabels.unrated');
        if (score >= 80) return t('carCard.qualityLabels.excellent');
        if (score >= 60) return t('carCard.qualityLabels.good');
        if (score >= 40) return t('carCard.qualityLabels.average');
        if (score >= 20) return t('carCard.qualityLabels.belowAverage');
        return t('carCard.qualityLabels.poor');
    } else {
        if (!score) return "Unrated";
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Average";
        if (score >= 20) return "Below Average";
        return "Poor";
    }
};