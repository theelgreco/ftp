import {createRouter, createWebHistory} from "vue-router";

const routes = [
    // {path: "/files", name: "Home", component: () => import("@/views/Directory.vue")},
    {path: "/files/:path(.*)*", name: "Home", component: () => import("@/views/Directory.vue")},
    {path: "/connect", name: "Connect", component: () => import("@/views/Connect.vue")},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router