let apiConfig = {
  API_SERVER: "http://localhost:8080",
  API_KEY: "QUIR1059D9BF662CC0F34D3BAFE40B32E1A41BA4",
};

export const setApiConfig = ({ apiServer, apiKey }) => {
  apiConfig.API_SERVER = apiServer;
  apiConfig.API_KEY = apiKey;
};

export const getApiConfig = () => apiConfig;
