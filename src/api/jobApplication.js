import api from ".";

/**
 * Fetch job application data
 * @param {Object} params - Parameters for fetching the job application.
 * @param {string} params.applicationId - The ID of the job application.
 * @param {string} params.jobId - The ID of the job.
 * @param {string} params.uniqueId - The unique identifier for the application.
 * @param {string} params.apiKey - The API key for authorization.
 * @returns {Promise} - The API response containing job application data.
 */
export const fetchJobApplication = async ({ applicationId, jobId, uniqueId, apiKey }) => {
  try {
    const response = await api
      .get("job_application", {
        searchParams: {
          applicationId,
          jobId,
          uniqueId,
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .json();

    return response;
  } catch (error) {
    console.error("Failed to fetch job application:", error);
    throw error;
  }
};

export default fetchJobApplication;
