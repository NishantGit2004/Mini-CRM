import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: BASE,
  timeout: 15_000,
});

// Example endpoints — adapt to your backend
export const auth = {
  loginMock: async () => {
    // If you have real auth, replace this request
    // return api.post('/auth/login', { ... })
    return {
      data: {
        name: "SDE Candidate",
        email: "candidate@example.com",
        imageUrl: `https://i.pravatar.cc/150?u=sde-candidate`,
      },
    };
  },
};

export const campaigns = {
  list: async () => {
    return api.get("/campaigns");
  },
  create: async (payload) => {
    return api.post("/campaigns", payload);
  },
  getSummary: async (campaignId) => {
    return api.get(`/campaigns/${campaignId}/summary`);
  },
};

export const segments = {
  create: async (payload) => api.post("/segments", payload),
  previewCount: async (payload) => api.post("/segments/preview", payload),
};

export default api;