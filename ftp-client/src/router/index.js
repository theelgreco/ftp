import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {path: "/files/:path(.*)*", name: "Home", component: () => import("@/views/Directory.vue")},
    {path: "/connect", name: "Connect", component: () => import("@/views/Connect.vue")},
    {path: "/sign-up", name: "SignUp", component: () => import("@/views/SignUp.vue")},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router