import { create } from "zustand";

const useColumnSortStore = create((set) => ({
  sorting: {},
  setSorting: (key, sortField, order = null) =>
    set((state) => ({
      sorting: {
        ...state.sorting,
        [key]: { key: sortField, order: order ?? state.sorting[key]?.order },
      },
    })),
  setGlobalSorting: (sorting) => set({ sorting }),
}));

export default useColumnSortStore;
