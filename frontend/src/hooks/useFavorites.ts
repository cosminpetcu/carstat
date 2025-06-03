"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PendingActionsManager, getCurrentUrlForReturn } from '@/utils/pendingActions';
import type { CarData } from '@/components/ui/CarCard';

interface UseFavoritesReturn {
    toggleFavorite: (car: CarData) => Promise<void>;
    isUpdatingFavorite: (carId: number) => boolean;
    updatingFavorites: number[];
}

export const useFavorites = (
    onSuccess?: (carId: number, newState: boolean) => void,
    onError?: (error: string) => void
): UseFavoritesReturn => {
    const router = useRouter();
    const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);

    const toggleFavorite = useCallback(async (car: CarData) => {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");

        if (!token || !userRaw) {
            const currentUrl = getCurrentUrlForReturn();
            const actionType = car.is_favorite ? 'remove' : 'add';
            PendingActionsManager.saveFavoriteAction(car.id, actionType, currentUrl);
            window.location.href = '/login';
            return;
        }

        let user;
        try {
            user = JSON.parse(userRaw);
            if (!user.id) throw new Error("Invalid user object");
        } catch (err) {
            console.error("User object invalid:", err);
            const currentUrl = getCurrentUrlForReturn();
            const actionType = car.is_favorite ? 'remove' : 'add';
            PendingActionsManager.saveFavoriteAction(car.id, actionType, currentUrl);
            window.location.href = '/login';
            return;
        }

        setUpdatingFavorites((prev) => [...prev, car.id]);

        try {
            const newFavoriteState = !car.is_favorite;

            if (car.is_favorite) {
                const response = await fetch(`http://localhost:8000/favorites/${car.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error('Failed to remove from favorites');
                }
            } else {
                const response = await fetch("http://localhost:8000/favorites", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        car_id: car.id,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to add to favorites');
                }
            }

            onSuccess?.(car.id, newFavoriteState);

        } catch (err) {
            console.error("Favorite toggle failed:", err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update favorites';
            onError?.(errorMessage);
        } finally {
            setUpdatingFavorites((prev) => prev.filter((id) => id !== car.id));
        }
    }, [onSuccess, onError]);

    const isUpdatingFavorite = useCallback((carId: number) => {
        return updatingFavorites.includes(carId);
    }, [updatingFavorites]);

    return {
        toggleFavorite,
        isUpdatingFavorite,
        updatingFavorites
    };
};