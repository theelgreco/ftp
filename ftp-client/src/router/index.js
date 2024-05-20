import {createRouter, createWebHistory} from "vue-router";

import Home from "@/views/Home.vue";
import Connect from "@/views/Connect.vue";

const routes = [
    {path: "/", name: "Home", component: Home},
    {path: "/connect", name: "Connect", component: Connect},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router