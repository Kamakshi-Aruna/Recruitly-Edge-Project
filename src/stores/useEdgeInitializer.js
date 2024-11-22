import { create } from "zustand";

import { PIPELINE_DATA_TYPE } from "../components/GlobalPipeline/constants";

/**
 * Zustand store for managing API authentication credentials.
 *
 * This store holds the API key and server URL, allowing components
 * to access and update these values easily.
 *
 * @typedef {Object} ApiAuthState
 * @property {string} apiKey - The API key used for authentication.
 * @property {string} apiServer - The base URL of the API server.
 * @property {(apiKey: string, apiServer: string) => void} setApiCredentials -
 * A function to update the API key and server URL.
 *
 * @returns {ApiAuthState} The current state and actions for managing API credentials.
 */
const useEdgeInitializer = create((set) => ({
  apiKey: "",
  apiServer: "",
  jobId: "",
  user: "",
  pipelineDataTyoe: PIPELINE_DATA_TYPE.all_my_open_jobs,
  /**
   * Sets the API credentials in the store.
   *
   * @param {string} apiKey - The API key to be set.
   * @param {string} apiServer - The base URL of the API server to be set.
   * @param {string} jobId - The job ID.
   * @param {string} userId - The user's id.
   * @param {string} tenantId - The tenantId.
   */
  setApiCredentials: ({ apiKey, apiServer, jobId }) => set({ apiKey, apiServer, jobId }),
  setPipelineDataType: (pipelineDataType) => set({ pipelineDataType }),
  setJobId: (jobId) => set({ jobId }),
}));

export default useEdgeInitializer;
