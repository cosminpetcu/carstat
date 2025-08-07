"use client";

import { useTranslations } from 'next-intl';

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
    const t = useTranslations('carCard');

    if (score === undefined) return null;

    const getQualityScoreColor = (score: number | undefined): string => {
        if (!score) return "bg-gray-300";
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-green-400";
        if (score >= 40) return "bg-yellow-400";
        if (score >= 20) return "bg-orange-500";
        return "bg-red-500";
    };

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base"
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 aspect-square ${getQualityScoreColor(score)} ${className}`}
            title={t('qualityScore', { score })}
            style={{
                minWidth: size === "sm" ? "32px" : size === "md" ? "40px" : "48px",
                minHeight: size === "sm" ? "32px" : size === "md" ? "40px" : "48px"
            }}
        >
            {score}
        </div>
    );
};