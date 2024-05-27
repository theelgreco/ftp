import axios from "axios";

exports.api = axios.create({
    baseURL: process.env.NODE_ENV === "production" ? "https://ftp-l4ir.onrender.com" : "http://127.0.0.1:8080"
});

exports.auth = axios.create({
    baseURL: process.env.NODE_ENV === "production" ? "https://auth-server-602v.onrender.com" : "http://127.0.0.1:9091"
});