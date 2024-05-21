import "./index.css"
import {createApp} from 'vue'

import App from './App.vue'
import router from "@/router/index.js";

import axios from "axios";

import PrimeVue from 'primevue/config';

const baseAxios = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8080" : "",
});

const app = createApp(App)
app.config.globalProperties.$http = baseAxios
app.use(router, PrimeVue).mount('#app')