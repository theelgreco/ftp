<template>
  <FloatingCard>
    <template v-slot:header>
      <div class="mb-5">
        <h1 class="w-fit text-2xl dark:text-white font-bold">Dashboard</h1>
        <h1 class="w-fit text-sm text-gray-400">View and manage your servers</h1>
      </div>
      <Button label="Add new server"
              class="bg-blue-500 text-white flex-grow sm:flex-grow-0 pl-2 py-2 pr-3 text-[13px] hover:bg-blue-600 active:bg-blue-700"
              icon="mdi mdi-plus"
              @click="handleAddServerClick"/>
    </template>
    <template v-slot:content>
      <div class="flex sm:flex-wrap sm:flex-row flex-nowrap flex-col w-full h-full overflow-y-auto
                  pt-3 pb-8">
        <template v-if="servers && servers.length">
          <ServerCard v-for="server in servers" :key="server.slug" :server="server"
                      @delete="openDeleteConfirmation(server)" @connect="connect(server.slug)"/>
        </template>
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
    </template>
  </FloatingCard>
  <ConfirmDialog :draggable="false"/>
</template>

<script>
import router from "@/router/index.js";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";
import ServerCard from "@/components/ServerCard.vue";
import FloatingCard from "@/components/FloatingCard.vue";

export default {
  name: "Dashboard",
  components: {FloatingCard, ServerCard, Button, ConfirmDialog},
  data() {
    return {
      servers: null,
      loading: false,
      error: false,
      success: false,
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
    async deleteServer(serverSlug) {
      try {
        await this.$http.delete(`api/servers/${serverSlug}`)
        window.location.reload()
      } catch (err) {
        console.error(err)
      }
    },
    handleAddServerClick() {
      router.push("/add-server")
    },
    connect(serverSlug) {
      router.push(`/${serverSlug}/`)
    },
    openDeleteConfirmation(server) {
      this.$confirm.require({
        message: `Are you sure you want to delete ${server.host}?`,
        header: "Delete",
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        rejectClass: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 mr-auto',
        acceptClass: 'bg-red-500 hover:bg-red-600 active:bg-red-700 focus:bg-red-700 text-white px-3 py-2',
        dismissableMask: true,
        blockScroll: true,
        accept: () => {
          this.deleteServer(server.slug)
        }
      })
    }
  },
  created() {
    this.getServers()
  }
}
</script>

<style>
.h {
  height: calc(100% - 50px);
}
</style>