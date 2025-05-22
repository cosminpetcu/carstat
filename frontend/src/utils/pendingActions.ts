export interface PendingAction {
  type: 'add_favorite' | 'remove_favorite' | 'save_search' | 'navigation';
  data: {
    car_id?: number;
    search_query?: string;
    target_path?: string;
  };
  returnUrl: string;
  timestamp: number;
}

const PENDING_ACTION_KEY = 'pending_action';
const ACTION_EXPIRY_TIME = 30 * 60 * 1000;

export class PendingActionsManager {
  
  static savePendingAction(action: PendingAction): void {
    const actionWithTimestamp = {
      ...action,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(actionWithTimestamp));
    console.log('Saved pending action:', actionWithTimestamp);
  }

  static getPendingAction(): PendingAction | null {
    try {
      const stored = localStorage.getItem(PENDING_ACTION_KEY);
      if (!stored) return null;
      
      const action: PendingAction = JSON.parse(stored);
      const now = Date.now();

      if (action.timestamp + ACTION_EXPIRY_TIME < now) {
        this.clearPendingAction();
        return null;
      }
      
      return action;
    } catch (error) {
      console.error('Error getting pending action:', error);
      this.clearPendingAction();
      return null;
    }
  }

  static clearPendingAction(): void {
    localStorage.removeItem(PENDING_ACTION_KEY);
    console.log('Cleared pending action');
  }

  static hasPendingAction(): boolean {
    return this.getPendingAction() !== null;
  }

  static saveFavoriteAction(carId: number, action: 'add' | 'remove', returnUrl: string): void {
    this.savePendingAction({
      type: action === 'add' ? 'add_favorite' : 'remove_favorite',
      data: { car_id: carId },
      returnUrl,
      timestamp: Date.now()
    });
  }

  static saveSearchAction(searchQuery: string, returnUrl: string): void {
    this.savePendingAction({
      type: 'save_search',
      data: { search_query: searchQuery },
      returnUrl,
      timestamp: Date.now()
    });
  }

  static saveNavigationIntent(targetPath: string): void {
    const currentUrl = getCurrentUrlForReturn();
    this.savePendingAction({
      type: 'navigation',
      data: { target_path: targetPath },
      returnUrl: currentUrl,
      timestamp: Date.now()
    });
  }
}

export const getCurrentUrlForReturn = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.pathname + window.location.search;
  }
  return '/';
};