<template>
  <section class="section w-full h-full select-none">
    <router-view></router-view>
  </section>
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
        "Authorization": `Bearer ${jwt}`
      }
    }
  }
}
</script>

<style scoped>
.section {
  background-color: #f1f1f1;
  background-image: radial-gradient(rgba(59, 130, 246, 1) 0.9500000000000001px, #f1f1f1 0.9500000000000001px);
  background-size: 19px 19px;
}
</style>