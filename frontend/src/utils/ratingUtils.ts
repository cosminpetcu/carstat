export interface RatingInfo {
    label: string;
    color: string;
    textColor: string;
}

export const getRatingInfo = (rating: string | undefined): RatingInfo | null => {
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

export const getQualityScoreColor = (score: number | undefined): string => {
    if (!score) return "bg-gray-300";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-400";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
};