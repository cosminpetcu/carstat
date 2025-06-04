"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseBrandsModelsReturn {
    brands: string[];
    models: string[];
    isLoadingBrands: boolean;
    isLoadingModels: boolean;
    fetchModels: (brand: string) => Promise<void>;
    clearModels: () => void;
}

export const useBrandsModels = (): UseBrandsModelsReturn => {
    const [brands, setBrands] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    useEffect(() => {
        const fetchBrands = async () => {
            setIsLoadingBrands(true);
            try {
                const response = await fetch('http://localhost:8000/analytics/available-brands');
                if (response.ok) {
                    const data = await response.json();
                    setBrands(data);
                } else {
                    console.error('Failed to fetch brands');
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setIsLoadingBrands(false);
            }
        };

        fetchBrands();
    }, []);

    const fetchModels = useCallback(async (brand: string) => {
        if (!brand) {
            setModels([]);
            return;
        }

        setIsLoadingModels(true);
        try {
            const response = await fetch(`http://localhost:8000/analytics/available-models/${brand}`);
            if (response.ok) {
                const data = await response.json();
                setModels(data);
            } else {
                console.error('Failed to fetch models for brand:', brand);
                setModels([]);
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            setModels([]);
        } finally {
            setIsLoadingModels(false);
        }
    }, []);

    const clearModels = useCallback(() => {
        setModels([]);
    }, []);

    return {
        brands,
        models,
        isLoadingBrands,
        isLoadingModels,
        fetchModels,
        clearModels
    };
};