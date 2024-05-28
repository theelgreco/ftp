import axios from "axios";
import router from "@/router/index.js";

export const api = axios.create({
    baseURL: process.env.NODE_ENV === "production" ? "https://ftp-l4ir.onrender.com" : "http://127.0.0.1:8080"
});

api.interceptors.response.use(
    async (response) => {
        return response;
    },
    async (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response && error.response.status === 401) {
            // If the error status is 401 (Unauthorized), redirect to the login page
            await router.push({name: 'login'});
        }

        return Promise.reject(error);
    }
);

export const auth = axios.create({
    baseURL: process.env.NODE_ENV === "production" ? "https://auth-server-602v.onrender.com" : "http://127.0.0.1:9091"
});