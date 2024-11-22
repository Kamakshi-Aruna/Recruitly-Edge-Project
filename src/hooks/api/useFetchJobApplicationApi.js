import { useQuery } from "react-query";

import { fetchJobApplication } from "@api/jobApplicationService.js";

import queryKeys from "./queryKeys.js";

/**
 * Custom hook to fetch job application data using react-query.
 *
 * @param {Object} params - The parameters for fetching job application data.
 * @param {string} params.applicationId - The ID of the job application.
 * @param {string} params.jobId - The ID of the job.
 * @param {number} params.uniqueId - The unique identifier for the application.
 * @param {string} params.apiKey - The API key for authorization.
 * @param {boolean} [params.isOpen=false] - A flag to determine if the query should be enabled.
 * @param {Object} [options] - Optional query options provided by react-query.
 *
 * @returns {Object} The result of the query, which includes the fetched data, loading state, and error information.
 */
export const useFetchJobApplication = ({ applicationId, jobId, uniqueId, apiKey, isOpen = false, ...options }) =>
  useQuery(
    [queryKeys.job_application, { applicationId, jobId, uniqueId }],
    () =>
      fetchJobApplication({
        applicationId,
        jobId,
        uniqueId,
        apiKey,
      }),
    {
      enabled: isOpen,
      ...options,
    },
  );
