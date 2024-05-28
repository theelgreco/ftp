<template>
  <div class="w-full h-full flex flex-col justify-center">
    <div
        class="form sm:w-[550px] xs:p-16 w-[90%] p-14 mx-auto border-1 border-gray-200 shadow-2xl rounded-2xl overflow-y-auto relative max-h-[90%]">
      <h1 class="w-fit text-2xl font-bold text-center">Add a new server</h1>
      <form class="flex flex-col gap-8 mt-12">
        <div class="flex flex-col gap-1">
          <label for="host" class="text-gray-400">Host</label>
          <input id="host" type="text" class="p-1.5 rounded" v-model="form.host"/>
        </div>
        <div class="flex flex-col gap-1">
          <label for="port" class="text-gray-400">Port</label>
          <input id="port" type="number" class="p-1.5 rounded" v-model="form.port"/>
        </div>
        <div class="flex flex-col gap-1">
          <label for="user" class="text-gray-400">Username</label>
          <input id="user" type="text" autocomplete="username" class="p-1.5 rounded" v-model="form.user"/>
        </div>
        <div class="flex flex-col gap-1">
          <label for="password" class="text-gray-400">Password</label>
          <input id="password" type="password" autocomplete="current-password" class="p-1.5 rounded"
                 v-model="form.password"/>
        </div>
        <div class="flex align-middle gap-3">
          <label for="secure" class="text-gray-400">Secure?</label>
          <input id="secure" type="checkbox" class="w-fit" v-model="form.secure"/>
        </div>
        <button
            class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition rounded py-3 px-8 text-white w-full mt-6"
            @click="addServer">
          Add server
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import router from "@/router/index.js";

export default {
  name: "Connect",
  data() {
    return {
      form: {
        host: "",
        port: 21,
        user: "",
        password: "",
        secure: false
      },
      loading: null,
      error: null,
      success: null
    }
  },
  methods: {
    async addServer(e) {
      e.preventDefault()
      let hasError = null
      let isSuccessful = null

      try {
        this.loading = true

        await this.$http.post("/api/servers", {...this.form})

        isSuccessful = true

        await router.push("/dashboard")
      } catch (err) {
        console.error(err)
        hasError = true
      } finally {
        this.loading = false
        this.error = hasError
        this.success = isSuccessful
      }
    }
  },
}
</script>

<style scoped>
.form {
  background-color: #f1f1f1;
}
</style>

<style lang="scss">
@use "three-dots" with (
$dot-color: rgba(59, 130, 246, 1)
);
</style>
