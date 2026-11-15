import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
});
export const errorMessage = (error) =>
  error.response?.data?.error || "Unable to connect. Please try again.";
export const imageUrl = (url) =>
  url?.startsWith("/uploads/") ? `${api.defaults.baseURL}${url}` : url;

export const loadCatalogue = () =>
  api.get("/catalogue").then((response) => response.data);
