import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PendingActionsManager, PendingAction } from '@/utils/pendingActions';

interface UsePendingActionsReturn {
  executePendingAction: () => Promise<void>;
  hasPendingAction: boolean;
}

export const usePendingActions = (): UsePendingActionsReturn => {
  const router = useRouter();

  const executeAction = async (action: PendingAction): Promise<boolean> => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    switch (action.type) {
      case 'add_favorite':
      case 'remove_favorite':
        if (!token || !userRaw) return false;
        
        const user = JSON.parse(userRaw);
        const carId = action.data.car_id;
        if (!carId) return false;

        try {
          const url = action.type === 'add_favorite' 
            ? "http://localhost:8000/favorites"
            : `http://localhost:8000/favorites/${carId}`;
          
          const options: RequestInit = {
            method: action.type === 'add_favorite' ? "POST" : "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              ...(action.type === 'add_favorite' && { "Content-Type": "application/json" })
            },
            ...(action.type === 'add_favorite' && {
              body: JSON.stringify({ user_id: user.id, car_id: carId })
            })
          };

          const response = await fetch(url, options);
          if (response.ok) {
            console.log(`Car ${carId} ${action.type === 'add_favorite' ? 'added to' : 'removed from'} favorites`);
            return true;
          }
        } catch (error) {
          console.error('Error executing favorite action:', error);
        }
        return false;

      case 'save_search':
        if (!token || !userRaw) return false;
        
        const userForSearch = JSON.parse(userRaw);
        const searchQuery = action.data.search_query;
        if (!searchQuery) return false;

        try {
          const response = await fetch("http://localhost:8000/saved-searches", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: userForSearch.id,
              query: searchQuery,
            }),
          });

          if (response.ok) {
            console.log('Search saved successfully');
            return true;
          }
        } catch (error) {
          console.error('Error saving search:', error);
        }
        return false;

      case 'navigation':
        const targetPath = action.data.target_path;
        if (!targetPath) return false;

        try {
          console.log(`Navigating to: ${targetPath}`);
          router.push(targetPath);
          return true;
        } catch (error) {
          console.error('Error navigating:', error);
        }
        return false;

      default:
        console.error('Unknown pending action type:', action.type);
        return false;
    }
  };

  const executePendingAction = useCallback(async (): Promise<void> => {
    const pendingAction = PendingActionsManager.getPendingAction();
    
    if (!pendingAction) {
      return;
    }

    console.log('Executing pending action:', pendingAction);

    try {
      const success = await executeAction(pendingAction);
      
      if (success) {
        const actionNames = {
          'add_favorite': 'Car added to favorites',
          'remove_favorite': 'Car removed from favorites',
          'save_search': 'Search saved successfully',
          'navigation': 'Navigation completed'
        };
        
        console.log(actionNames[pendingAction.type] || 'Action completed');

        if (pendingAction.type === 'navigation') {
          PendingActionsManager.clearPendingAction();
          return;
        }

        if (pendingAction.returnUrl && pendingAction.returnUrl !== '/login') {
          setTimeout(() => {
            router.push(pendingAction.returnUrl);
          }, 100);
        }
      }
      
      PendingActionsManager.clearPendingAction();
      
    } catch (error) {
      console.error('Error executing pending action:', error);
      PendingActionsManager.clearPendingAction();
    }
  }, [router]);

  const [hasPendingAction, setHasPendingAction] = useState(false);

  useEffect(() => {
    setHasPendingAction(PendingActionsManager.hasPendingAction());
    }, []);

  return {
    executePendingAction,
    hasPendingAction
  };
};