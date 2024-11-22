import ky from "ky";

import useEdgeInitializer from "@stores/useEdgeInitializer.js";

export const fetchUserList = async () => {
  const { apiKey, apiServer } = useEdgeInitializer.getState();

  if (!apiKey) {
    return { data: null };
  }

  const response = await ky.get(`${apiServer}/api/user_list`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
};
