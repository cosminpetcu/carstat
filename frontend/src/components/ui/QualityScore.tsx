import { getQualityScoreColor } from "@/utils/ratingUtils";

interface QualityScoreProps {
    score: number | undefined;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const QualityScore: React.FC<QualityScoreProps> = ({
    score,
    size = "md",
    className = ""
}) => {
    if (score === undefined) return null;

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base"
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 aspect-square ${getQualityScoreColor(score)} ${className}`}
            title={`Quality Score: ${score}/100`}
            style={{
                minWidth: size === "sm" ? "32px" : size === "md" ? "40px" : "48px",
                minHeight: size === "sm" ? "32px" : size === "md" ? "40px" : "48px"
            }}
        >
            {score}
        </div>
    );
};