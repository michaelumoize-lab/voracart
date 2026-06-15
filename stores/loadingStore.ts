import { create } from "zustand";

interface LoadingStore {
  activeCount: number;
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(action: () => Promise<T>, important?: boolean) => Promise<T>;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  activeCount: 0,
  isLoading: false,
  startLoading: () =>
    set((state) => ({
      activeCount: state.activeCount + 1,
      isLoading: true,
    })),
  stopLoading: () =>
    set((state) => {
      const nextCount = Math.max(0, state.activeCount - 1);
      return {
        activeCount: nextCount,
        isLoading: nextCount > 0,
      };
    }),
  withLoading: async <T>(action: () => Promise<T>, important = true) => {
    if (!important) {
      return action();
    }

    set((state) => ({
      activeCount: state.activeCount + 1,
      isLoading: true,
    }));

    try {
      return await action();
    } finally {
      set((state) => {
        const nextCount = Math.max(0, state.activeCount - 1);
        return {
          activeCount: nextCount,
          isLoading: nextCount > 0,
        };
      });
    }
  },
}));
