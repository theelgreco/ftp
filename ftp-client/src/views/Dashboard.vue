<template>
  <div class="w-full h-full flex flex-col justify-center">
    <div class="content md:w-[90%] w-[90%] max-h-[90%] min-h-[50%] mx-auto border-1 border-gray-200 shadow-2xl
                rounded-2xl relative flex flex-col bg-[#f1f1f1] p-8 sm:p-10">
      <div class="sticky top-0 bg-[#f1f1f1] w-full p-1">
        <div class="mb-5">
          <h1 class="w-fit text-2xl font-bold">Dashboard</h1>
          <h1 class="w-fit text-sm text-gray-400">View and manage your servers</h1>
        </div>
        <Button label="Add new server"
                class="bg-blue-500 text-white flex-grow sm:flex-grow-0 pl-2 py-2 pr-3 text-[13px] hover:bg-blue-600 active:bg-blue-700"
                icon="mdi mdi-plus"
                @click="handleAddServerClick"/>
        <hr class="mt-3"/>
      </div>
      <div class="flex sm:flex-wrap sm:flex-row flex-nowrap flex-col w-full h-full overflow-y-auto
                  pt-6 pb-8">
        <template v-if="servers && servers.length">
          <div v-for="server in servers" :key="server.slug"
               class="p-1 w-full h-fit md:w-1/2 lg:w-1/3">
            <div
                class="p-5 border-1 w-full h-fit border-blue-400 flex flex-col gap-1 rounded overflow-hidden hover:shadow-lg cursor-pointer transition">
              <span class="mb-3 overflow-hidden text-ellipsis">
                <i class="mdi mdi-web mr-1 text-gray-400"/><span class="font-bold">{{ server.host }}</span>
              </span>
              <div>
                <p class="text-gray-400 text-[9px]">Username</p>
                <p class="text-[12px]">{{ server.user }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-[9px]">Password</p>
                <p class="mt-1 text-[12px]">*********</p>
              </div>
              <div class="mt-[-0.25rem]">
                <p class="text-gray-400 text-[9px]">Port</p>
                <p class="text-[12px]">{{ server.port }}</p>
              </div>
              <div class="flex items-center">
                <p class="text-gray-400 text-[9px]">Secure?</p>
                <p class="text-[12px]">
                  <i class="mdi"
                     :class="{'mdi-close text-red-400': !server.secure, 'mdi-check text-green-400': server.secure}"/>
                </p>
              </div>
              <div class="flex mt-5">
                <Button label="Delete"
                        class="text-blue-500 text-[13px] hover:underline"
                        @click="deleteServer(server.slug)"/>
                <Button label="Connect"
                        class="border-1 border-blue-500 text-blue-500 pl-3 py-2 pr-2 text-[13px] hover:bg-blue-50 active:bg-blue-100 ml-auto"
                        icon="mdi mdi-chevron-right"
                        icon-pos="right"
                        @click="connect(server.slug)"/>
              </div>
            </div>
          </div>
        </template>
      </div>
<!--      <div v-if="loading"-->
<!--           class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-5 text-gray-400">-->
<!--        <h1 class="w-fit">Connecting to <span class="text-gray-600">{{ form.host }}</span></h1>-->
<!--        <div class="dot-elastic"></div>-->
<!--      </div>-->
<!--      <div v-else-if="error"-->
<!--           class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-3 text-gray-400">-->
<!--        <i class="mdi mdi-alpha-x-circle-outline text-red-500 text-[250px] max-h-[250px] flex items-center"/>-->
<!--        <p class="text-gray-400 text-center">-->
<!--          Failed to connect to <span class="text-gray-600">{{ form.host }}</span>-->
<!--        </p>-->
<!--        <button-->
<!--            class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition rounded py-3 px-8 w-fit text-white mx-auto mt-12"-->
<!--            @click="error = false">-->
<!--          Try again-->
<!--        </button>-->
<!--      </div>-->
<!--      <div v-else-if="success"-->
<!--           class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full h-full bg-white flex flex-col justify-center items-center gap-3 text-gray-400">-->
<!--        <i class="mdi mdi-check-circle-outline text-green-500 text-[250px] max-h-[250px] flex items-center"/>-->
<!--        <p class="text-gray-400 text-center">-->
<!--          Successfully connected to <span class="text-gray-600">{{ form.host }}</span>-->
<!--        </p>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script>
import router from "@/router/index.js";
import Button from "primevue/button";

export default {
  name: "Dashboard",
  components: {Button},
  data() {
    return {
      servers: null,
      loading: false,
      error: false,
      success: false,
      serverToDelete: null,
    }
  },
  methods: {
    async getServers() {
      try {
        const {data} = await this.$http.get("api/servers")
        this.servers = data.results
      } catch (err) {
        console.error(err)
      }
    },
    async deleteServer(serverSlug){
      try {
        await this.$http.delete(`api/servers/${serverSlug}`)
        window.location.reload()
      } catch (err){
        console.error(err)
      }
    },
    handleAddServerClick() {
      router.push("/add-server")
    },
    connect(serverSlug){
      router.push(`/${serverSlug}/`)
    }
  },
  created() {
    this.getServers()
  }
}
</script>

<style scoped>
</style>