import 'primevue/resources/themes/aura-light-blue/theme.css'
import "./index.css"
import {createApp} from 'vue'

import App from './App.vue'
import router from "@/router/index.js";

import PrimeVue from 'primevue/config';
import DialogService from 'primevue/dialogservice';
import ConfirmationService from "primevue/confirmationservice";

import {api, auth} from "./axios.js"

const app = createApp(App)

app.config.globalProperties.$http = api
app.config.globalProperties.$auth = auth

app.use(router).use(PrimeVue).use(DialogService).use(ConfirmationService).mount('#app')