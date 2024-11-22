import ky from "ky";

import useEdgeInitializer from "@stores/useEdgeInitializer.js";

import { PIPELINE_DATA_TYPE } from "../components/GlobalPipeline/constants";

export const fetchColumnNames = async () => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.get(`${apiServer}/api/masterdata/job_pipeline`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const fetchJobData = async (jobId) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.get(`${apiServer}/api/job?id=${jobId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const fetchPipelineData = async (jobId, pipelineDataType) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  let dataTypeQueryParam = "";

  if (pipelineDataType === PIPELINE_DATA_TYPE.all_my_open_jobs) {
    dataTypeQueryParam = "myJobs=true";
  }
  if (pipelineDataType === PIPELINE_DATA_TYPE.all_users_open_jobs) {
    dataTypeQueryParam = "allOpenJobs=true";
  }

  const response = await ky.get(`${apiServer}/api/job_pipeline_data?jobId=${jobId}&${dataTypeQueryParam}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const fetchPipelineCardData = async (pipeCardId) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.get(`${apiServer}/api/job_pipeline_card_data?pipeCardId=${pipeCardId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const fetchPipelineCardsData = async (pipeCardIds) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.post(`${apiServer}/api/job_pipeline_card_data_list`, {
    json: { pipeCardIds },
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const fetchTableColumns = async () => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.get(`${apiServer}/api/settings/grid/columns?module=JOB_PIPELINE`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const updateTableColumns = async (columns) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.post(`${apiServer}/api/settings/gridcolumns/width`, {
    json: { module: "JOB_PIPELINE", columns },
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};
