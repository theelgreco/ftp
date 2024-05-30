<template>
  <div class="w-full h-full flex flex-col justify-center">
    <div class="form sm:w-[550px] xs:p-16 w-[90%] p-10 mx-auto border-1 border-gray-200 dark:border-gray-600 shadow-2xl
                rounded-2xl overflow-y-auto max-h-[90%] bg-off-white dark:bg-gray-800">
      <h1 class="w-fit text-2xl font-bold text-center dark:text-white">Welcome</h1>
      <form class="flex flex-col gap-8 mt-12">
        <div class="flex flex-col gap-1">
          <label for="email" class="text-gray-400">Email address</label>
          <input id="email" type="text" class="p-1.5 rounded" v-model="form.email"/>
        </div>
        <div class="flex flex-col gap-1">
          <label for="password" class="text-gray-400">Password</label>
          <input id="password" type="password" autocomplete="current-password" class="p-1.5 rounded"
                 v-model="form.password"/>
        </div>
        <div class="w-full flex flex-col gap-4 mt-6">
          <button
              class="border-1 border-blue-500 hover:bg-blue-100 active:bg-blue-200 transition rounded py-3 px-8
                     text-blue-500 mx-auto w-full dark:hover:bg-gray-900 dark:active:bg-gray-950"
              @click="handleLoginClick">
            Login
          </button>
          <button
              class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition rounded py-3 px-8 text-white mx-auto
                     flex-grow w-full"
              @click="handleSignUpClick">
            Sign up
          </button>
        </div>
      </form>
      <!--        <div v-if="loading"-->
      <!--             class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-5 text-gray-400">-->
      <!--          <h1 class="w-fit">Connecting to <span class="text-gray-600">{{ form.host }}</span></h1>-->
      <!--          <div class="dot-elastic"></div>-->
      <!--        </div>-->
      <!--        <div v-else-if="error"-->
      <!--             class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-3 text-gray-400">-->
      <!--          <i class="mdi mdi-alpha-x-circle-outline text-red-500 text-[250px] max-h-[250px] flex items-center"/>-->
      <!--          <p class="text-gray-400 text-center">-->
      <!--            Failed to connect to <span class="text-gray-600">{{ form.host }}</span>-->
      <!--          </p>-->
      <!--          <button-->
      <!--              class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition rounded py-3 px-8 w-fit text-white mx-auto mt-12"-->
      <!--              @click="error = false">-->
      <!--            Try again-->
      <!--          </button>-->
      <!--        </div>-->
      <!--        <div v-else-if="success"-->
      <!--             class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-3 text-gray-400">-->
      <!--          <i class="mdi mdi-check-circle-outline text-green-500 text-[250px] max-h-[250px] flex items-center"/>-->
      <!--          <p class="text-gray-400 text-center">-->
      <!--            Successfully connected to <span class="text-gray-600">{{ form.host }}</span>-->
      <!--          </p>-->
      <!--        </div>-->
    </div>
  </div>
</template>

<script>
import router from "@/router/index.js";

export default {
  name: "SignUp",
  data() {
    return {
      form: {
        email: "",
        password: ""
      }
    }
  },
  methods: {
    handleSignUpClick(e) {
      e.preventDefault()
      this.signUp()
    },
    handleLoginClick(e) {
      e.preventDefault()
      this.login()
    },
    async signUp() {
      try {
        await this.$auth.post("sign-up", {...this.form, service: "ftp"})
        await this.login()
      } catch (err) {
        console.error(err)
      }
    },
    async login() {
      try {
        const {data} = await this.$auth.post("login", {...this.form, service: "ftp"})
        const {jwt} = data

        localStorage.setItem("jwt", jwt)
        this.$http.defaults.headers.common = {
          "Authorization": `Bearer ${jwt}`
        }

        await router.push("/dashboard")
      } catch (err) {
        console.error(err)
      }
    }
  },
  async created() {
    const jwt = localStorage.getItem("jwt")

    if (jwt) {
      this.$http.defaults.headers.common = {
        "Authorization": `Bearer ${jwt}`
      }

      try {
        await this.$http.get("api/validateJWT")
        await router.push("/dashboard")
      } catch (err) {
        this.$http.defaults.headers.common.Authorization = ""
        localStorage.removeItem("jwt")
        console.error(err)
      }
    }
  }
}
</script>

<style lang="scss">
@use "three-dots" with (
  $dot-color: rgba(59, 130, 246, 1)
);
</style>