import ky from "ky";

export const BASE_URL = "https://api.cloud.recruitly.io/api";

const api = ky.create({
  prefixUrl: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
