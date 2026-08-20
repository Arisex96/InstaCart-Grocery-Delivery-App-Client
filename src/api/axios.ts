import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://insta-cart-grocery-delivery-app-ser.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const isDelivery =
      config.url?.startsWith("/delivery") &&
      !config.url?.startsWith("/delivery/login");
    const token = isDelivery
      ? localStorage.getItem("delivery_token")
      : localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
