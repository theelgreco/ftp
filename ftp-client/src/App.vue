<template>
  <nav-bar :current-route="currentRoute"/>
  <router-view></router-view>
  <dynamic-dialog/>
</template>

<script>
import DynamicDialog from "primevue/dynamicdialog";
import NavBar from "@/components/NavBar.vue";

export default {
  components: {DynamicDialog, NavBar},
  computed: {
    currentRoute(){
      return this.$route
    }
  },
}
</script>