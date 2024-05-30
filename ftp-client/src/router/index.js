import {createRouter, createWebHistory} from "vue-router";

import {api} from "@/axios.js";

const routes = [
    {
        path: '/',
        meta: {isLogin: true, hasDashboardButton: false},
        redirect: '/login'
    },
    {
        path: "/login",
        name: "Login",
        meta: {title: "Login", isLogin: true, hasDashboardButton: false},
        component: () => import("@/views/Login.vue")
    },
    {
        path: "/dashboard",
        name: "Dashboard",
        meta: {title: "Dashboard", requiresAuth: true, hasDashboardButton: false},
        component: () => import("@/views/Dashboard.vue")
    },
    {
        path: "/add-server",
        name: "AddServer",
        meta: {title: "Add Server", requiresAuth: true, hasDashboardButton: true},
        component: () => import("@/views/AddServer.vue")
    },
    {
        path: "/:server/:path(.*)*",
        name: "Files",
        meta: {title: "Files", requiresAuth: true, hasDashboardButton: true},
        component: () => import("@/views/Directory.vue")
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        const jwt = localStorage.getItem("jwt")

        if (jwt) {
            api.defaults.headers.common = {
                "Authorization": `Bearer ${jwt}`
            }
        }

        try {
            await api.get("/api/validateJWT")
            next()
        } catch (err) {
            api.defaults.headers.common.Authorization = ""
            localStorage.removeItem("jwt")
            next("/login")
        }
    } else {
        next()
    }
})

router.afterEach((to, from) => {
    document.title = to.meta.title || "FTP Client"
})

export default router