<template>
  <nav class="w-full h-fit flex">
    <Button v-if="currentRoute.meta.hasDashboardButton" label="Dashboard"
            icon="mdi mdi-chevron-left text-black dark:text-white"
            @click="router.push('/dashboard')"
            class="shadow-xl py-2 pl-1 pr-3 bg-off-white border-1 border-gray-300
                   dark:border-gray-400 text-gray-400 dark:bg-gray-800 dark:text-white"/>
    <div class="bg-off-white dark:bg-gray-800 w-[50px] right-3 top-3 rounded shadow-xl text-gray-400 cursor-pointer
              border-1 aspect-square border-gray-300 dark:border-gray-400 grid place-items-center text-2xl ml-auto"
         @click="changeTheme">
      <i class="text-yellow-500 dark:text-white" :class="themeIcon"/>
    </div>
  </nav>
</template>

<script>
import router from "@/router/index.js";
import Button from "primevue/button";

export default {
  name: "NavBar",
  components: {Button},
  props: {
    currentRoute: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      theme: "dark",
      themeIcon: "mdi mdi-weather-night"
    }
  },
  computed: {
    router() {
      return router
    }
  },
  methods: {
    changeTheme() {
      const html = document.querySelector("html")
      html.classList.toggle("dark")
      this.theme = this.theme === "dark" ? "light" : "dark"
      this.themeIcon = this.theme === "dark" ? "mdi mdi-weather-night" : "mdi mdi-white-balance-sunny"
    }
  },
}
</script>