import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {path: '/', redirect: '/dashboard'},
    {path: "/login", name: "SignUp", component: () => import("@/views/Login.vue")},
    {path: "/dashboard", name: "Dashboard", component: () => import("@/views/Dashboard.vue")},
    {path: "/connect", name: "Connect", component: () => import("@/views/Connect.vue")},
    {path: "/:server/:path(.*)*", name: "Home", component: () => import("@/views/Directory.vue")},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router