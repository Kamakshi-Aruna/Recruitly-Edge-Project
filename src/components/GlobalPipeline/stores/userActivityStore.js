import { create } from "zustand";

export const ACTIVITY_TYPES = {
  job: "JOB",
  pipeline_data: "PIPELINE_DATA",
};

const useUserActivityStore = create((set) => ({
  lastViewed: {},
  setLastViewed: (lastViewed) => set({ lastViewed }),
}));

export default useUserActivityStore;
