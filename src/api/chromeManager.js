import ky from "ky";

import useEdgeInitializer from "@stores/useEdgeInitializer.js";

export const fetchApolloData = async (endpoint) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.get(`${apiServer}/api/apollo/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};

export const deleteImport = async (requestId, type) => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  const response = await ky.delete(`${apiServer}/api/apollo/${type}/${requestId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  return response.json();
};
