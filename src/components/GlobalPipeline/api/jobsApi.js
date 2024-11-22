import ky from "ky";

import useEdgeInitializer from "@stores/useEdgeInitializer";

import { JOB_TYPES } from "../constants";

export const fetchMyJobs = async () => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.get(`${apiServer}/api/job_search/my_jobs`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const fetchAllJobs = async () => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.get(`${apiServer}/api/job_search/all_open_jobs`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const fetchJobStats = async (params) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  let queryParams = [];

  if (params.jobType === JOB_TYPES.all_jobs) {
    queryParams.push("allOpenJobs=true");
  }

  if (params.jobType === JOB_TYPES.my_jobs) {
    queryParams.push("myJobs=true");
  }

  if (params.includeRejected) {
    queryParams.push("includeRejected=true");
  }

  if (params.jobIds) {
    queryParams.push(`jobId=${params.jobIds}`);
  }

  const response = await ky.get(`${apiServer}/api/job_pipeline_stats?${queryParams.join("&")}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};
