import 'primevue/resources/themes/aura-light-blue/theme.css'
import "./index.css"
import {createApp} from 'vue'

import App from './App.vue'
import router from "@/router/index.js";

import axios from "axios";

import PrimeVue from 'primevue/config';
import DialogService from 'primevue/dialogservice';

const baseAxios = axios.create({
    baseURL: process.env.NODE_ENV === "production" ? "https://ftp-l4ir.onrender.com" : "http://127.0.0.1:8080"
});

const app = createApp(App)
app.config.globalProperties.$http = baseAxios
app.use(router).use(PrimeVue).use(DialogService).mount('#app')