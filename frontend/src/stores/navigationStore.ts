import { create } from 'zustand';

interface NavigationState {
  
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  
  drawerOpen: false,

  setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),
  
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
}));

