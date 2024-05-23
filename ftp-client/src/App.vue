<template>
  <router-view></router-view>
  <dynamic-dialog/>
</template>

<script>
import router from "@/router/index.js";
import DynamicDialog from "primevue/dynamicdialog";

export default {
  components: {DynamicDialog},
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