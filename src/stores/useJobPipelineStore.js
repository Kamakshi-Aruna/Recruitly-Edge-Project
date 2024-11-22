import { create } from "zustand";

import { STATE_FILTER_TYPES, VIEW_MODES } from "../components/JobPipeline/constants";
import { USER_FILTER_TYPES } from "../components/JobPipeline/FilterDropdown/utils";

const INITIAL_FILTERS = {
  searchValue: "",
  usersFilter: [],
  userTypeFilter: [USER_FILTER_TYPES.PIPELINE_OWNER],
  statusFilter: [],
  stateFilter: STATE_FILTER_TYPES.active,
  rejectReasonsFilter: [],
  dateFilter: {},
};

const useViewModeStore = create((set) => ({
  viewMode: VIEW_MODES.kanban,
  setViewMode: (viewMode) => set({ viewMode }),
}));

const useJobPipelineStore = create((set) => ({
  selectedItems: {},
  filters: INITIAL_FILTERS,
  isGlobalPipeline: false,
  setSelectedItems: (items, jobId) =>
    set((state) => {
      const newSelectedItems = structuredClone(state.selectedItems);
      newSelectedItems[jobId] = items;
      return { selectedItems: newSelectedItems };
    }),
  clearSelectedItems: (jobId) =>
    set((state) => {
      const newSelectedItems = structuredClone(state.selectedItems);
      delete newSelectedItems[jobId];
      return { selectedItems: newSelectedItems };
    }),
  setFilters: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  clearFilters: () => set({ filters: { ...INITIAL_FILTERS } }),
  setIsGlobalPipeline: (isGlobalPipeline) => set({ isGlobalPipeline }),
}));

export default useJobPipelineStore;
export { useViewModeStore };
