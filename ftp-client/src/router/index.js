import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {path: "/files/:path(.*)*", name: "Home", component: () => import("@/views/Directory.vue")},
    {path: "/connect", name: "Connect", component: () => import("@/views/Connect.vue")},
    {path: "/login", name: "SignUp", component: () => import("@/views/Login.vue")},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router