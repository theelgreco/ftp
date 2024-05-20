<template>
  <router-view></router-view>
</template>

<script>
import router from "@/router/index.js";

export default {
  created() {
    const sessionId = sessionStorage.getItem("sessionId")
    if (!sessionId) {
      router.push("connect")
    } else {
      this.$http.defaults.headers.common = {
        sessionId
      }
    }
  }
}
</script>