import { useQuery } from "react-query";

import { fetchAllJobs, fetchJobStats, fetchMyJobs } from "../../api/jobsApi";
import { QUERY_KEYS } from "../../constants/queryKeys";

export const useFetchMyJobs = ({ searchTerm, ...options }) => {
  return useQuery([QUERY_KEYS.my_jobs], fetchMyJobs, {
    select: ({ data }) => {
      if (searchTerm) {
        return data?.filter(({ title, company, reference }) => {
          const searchTermLower = searchTerm.toLowerCase();
          return title?.toLowerCase().includes(searchTermLower) || company?.name?.toLowerCase().includes(searchTermLower) || reference?.toLowerCase().includes(searchTermLower);
        });
      }
      return data;
    },
    ...options,
  });
};

export const useFetchAllOpenJobs = ({ searchTerm, ...options }) => {
  return useQuery([QUERY_KEYS.all_open_jobs], fetchAllJobs, {
    select: ({ data }) => {
      if (searchTerm) {
        return data?.filter(({ title, company, reference }) => {
          const searchTermLower = searchTerm.toLowerCase();
          return title?.toLowerCase().includes(searchTermLower) || company?.name?.toLowerCase().includes(searchTermLower) || reference?.toLowerCase().includes(searchTermLower);
        });
      }
      return data;
    },
    ...options,
  });
};

export const useFetchJobStats = (params = {}, options) => {
  return useQuery([QUERY_KEYS.job_stats, { params }], () => fetchJobStats(params), {
    select: ({ data }) => data,
    ...options,
  });
};
