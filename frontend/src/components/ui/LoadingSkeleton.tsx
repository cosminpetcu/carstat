"use client";

import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CarCardSkeleton: React.FC<{ variant?: "grid" | "list" | "compact" }> = ({
    variant = "grid"
}) => {
    if (variant === "list") {
        return (
            <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3">
                        <Skeleton className="h-[220px] md:h-[200px] w-full" />
                    </div>
                    <div className="w-full md:w-2/3 p-5">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-14" />
                    </div>
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <Skeleton className="h-[220px] w-full" />
            <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    );
};

export const FormFieldSkeleton: React.FC = () => (
    <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
    </div>
);

export const SearchResultsSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }, (_, i) => (
            <CarCardSkeleton key={i} variant="grid" />
        ))}
    </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
    <tr className="animate-pulse">
        {Array.from({ length: columns }, (_, i) => (
            <td key={i} className="px-6 py-4">
                <Skeleton className="h-4 w-full" />
            </td>
        ))}
    </tr>
);

export const StatsCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
        </div>
    </div>
);

export const PageLoadingSkeleton: React.FC = () => (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-pulse">
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="lg:col-span-3">
                    <SearchResultsSkeleton count={9} />
                </div>
            </div>
        </div>
    </div>
);