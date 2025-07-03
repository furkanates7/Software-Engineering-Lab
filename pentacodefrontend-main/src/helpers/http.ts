import axios from "axios";

export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const api = axios.create({
  baseURL:  "http://localhost:8080",
});
