<template>
  <router-view></router-view>
  <dynamic-dialog/>
</template>

<script>
import router from "@/router/index.js";
import DynamicDialog from "primevue/dynamicdialog";

export default {
  components: {DynamicDialog},
  async created() {
    const jwt = localStorage.getItem("jwt")

    if (!jwt) {
      await router.push("login")
    } else {
      this.$http.defaults.headers.common = {
        jwt
      }
    }
  }
}
</script>