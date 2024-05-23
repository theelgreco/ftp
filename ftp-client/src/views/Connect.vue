<template>
  <section class="section w-full h-full flex flex-col justify-center select-none">
    <div
        class="form md:w-[550px] md:p-16 w-[90%] p-14 mx-auto border-1 border-gray-200 shadow-2xl rounded-2xl overflow-y-auto relative max-h-[90%]">
      <h1 class="w-fit mx-auto text-2xl font-bold text-center">Connect to a server</h1>
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
            class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition rounded py-3 px-8 w-fit text-white mx-auto"
            @click="connect">
          Connect
        </button>
      </form>
      <div v-if="loading"
           class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-5 text-gray-400">
        <h1 class="w-fit">Connecting to <span class="text-gray-600">{{ form.host }}</span></h1>
        <div class="dot-elastic"></div>
      </div>
      <div v-else-if="error"
           class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-3 text-gray-400">
        <i class="mdi mdi-alpha-x-circle-outline text-red-500 text-[250px] max-h-[250px] flex items-center"/>
        <p class="text-gray-400">Failed to connect to <span class="text-gray-600">{{ form.host }}</span></p>
        <button
            class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition rounded py-3 px-8 w-fit text-white mx-auto mt-12"
            @click="error = false">
          Try again
        </button>
      </div>
      <div v-else-if="success"
           class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-3 text-gray-400">
        <i class="mdi mdi-check-circle-outline text-green-500 text-[250px] max-h-[250px] flex items-center"/>
        <p class="text-gray-400">Successfully connected to <span class="text-gray-600">{{ form.host }}</span></p>
      </div>
    </div>
  </section>
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
        secure: true
      },
      loading: null,
      error: null,
      success: null
    }
  },
  methods: {
    async connect(e) {
      e.preventDefault()
      let hasError = null
      let isSuccessful = null

      try {
        this.loading = true

        const {data} = await this.$http.post("/api/connect", {...this.form})
        sessionStorage.setItem("sessionId", data.slug)

        this.$http.defaults.headers.common = {
          "sessionId": data.slug
        }

        isSuccessful = true

        setTimeout(() => {
          router.push("/files")
        }, 2000)
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
  created() {
    console.log(process.env.NODE_ENV)
    console.log(process.env.API_URL)
  }
}
</script>

<style scoped>
.section {
  background-color: #f1f1f1;
  background-image: radial-gradient(rgba(59, 130, 246, 1) 0.9500000000000001px, #f1f1f1 0.9500000000000001px);
  background-size: 19px 19px;
}

.form {
  background-color: #f1f1f1;
}
</style>

<style lang="scss">
@use "three-dots" with (
$dot-color: rgba(59, 130, 246, 1)
);
</style>
