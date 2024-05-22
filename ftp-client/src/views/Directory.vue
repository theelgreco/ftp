<template>
  <section class="section w-full h-full flex flex-col justify-center select-none">
    <div class="content md:w-[90%] w-[90%] md:p-16 max-h-[90%] min-h-[50%] p-14 mx-auto border-1 border-gray-200 shadow-2xl
                rounded-2xl relative flex flex-col gap-6">
      <Breadcrumb :home="home" :model="items" class="sticky top-0 bg-[#f1f1f1] breadcrumb pb-3 w-full">
        <template #item="{ item }">
          <div v-if="item.icon" class="cursor-pointer" @mousedown="goTo('/')">
            <i class="mdi mdi-home"/>
          </div>
          <div v-else class="cursor-pointer" @mousedown="goTo(item.path)">
            {{ item.label }}
          </div>
        </template>
      </Breadcrumb>
      <div class="flex flex-wrap gap-6 w-full h-full overflow-y-auto" v-if="files.length">
        <div v-for="file in files" :key="file.name"
             class="item flex flex-col items-center text-center w-[23%] max-w-[100px] p-3 max-h-[100px] rounded
                    hover:bg-blue-50 transition"
             :title="file.name"
             @mousedown="handleFileClick(file)">
          <template v-if="file.type === 2">
            <i class="mdi mdi-folder text-5xl text-blue-300"/>
            <p class="overflow-hidden text-ellipsis max-w-[100%] text-gray-500">
              {{ file.name }}
            </p>
          </template>
          <template v-else-if="file.type === 1">
            <i class="mdi mdi-file text-5xl text-gray-300"/>
            <p class="text-ellipsis overflow-hidden max-w-[100%] text-gray-500">{{ file.name }}</p>
          </template>
        </div>
      </div>
      <div v-else>
        No files in this directory
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from "primevue/breadcrumb";
import ContextMenu from "primevue/contextmenu";
import router from "@/router/index.js";
import SelectionRect from "@/classes/Drag.js";

export default {
  name: "Directory",
  components: {Breadcrumb, ContextMenu},
  data() {
    return {
      files: [],
      home: {
        icon: 'mdi mdi-home'
      },
      loading: null,
      error: null,
      success: null,
      selected: null,
      clicked: false
    }
  },
  computed: {
    path() {
      let paths = ["/"]
      const pathURL = this.$route.params.path

      if (pathURL) paths = paths.concat(...pathURL)

      return paths
    },
    items() {
      const res = []
      this.path.forEach((dir, index) => {
        if (index) {
          res.push({label: dir, path: this.getPathString(index)})
        }
      })
      return res
    },
  },
  methods: {
    getPathString(atIndex) {
      let URL = `/`

      if (this.path.length > 1 || atIndex > 0) {
        URL = atIndex ? URL + `${this.path.slice(1, atIndex + 1).join("/")}` : URL + `${this.path.slice(1).join("/")}/`
      }

      return URL
    },
    async getFiles() {
      let hasError = null
      let isSuccessful = null

      const path = this.getPathString()

      try {
        this.loading = true
        const {data} = await this.$http.get("/api/files", {params: {path}})
        this.files = data.files
        isSuccessful = true
      } catch (err) {
        console.error(err)
        hasError = true
      } finally {
        this.loading = false
        this.error = hasError
        this.success = isSuccessful
      }
    },
    handleFileClick(file) {
      if (!this.clicked) {
        this.clicked = true
        this.selected = file.name
        setTimeout(() => {
          this.clicked = false
        }, 500)
      } else if (file.type === 2 && this.selected === file.name) {
        this.goForward(file.name)
      }
    },
    async goTo(path) {
      await router.push(`/files${path}`)
    },
    async goForward(directory) {
      const newRoute = this.getPathString()
      await router.push(`/files${newRoute}${directory}`)
    },
    onRightClick(e){
      this.$refs.menu.show(event);
    }
  },
  async created() {
    await this.getFiles()
    this.$watch(() => this.$route.params.path, this.getFiles)
    new SelectionRect()
  }
}
</script>


<style lang="postcss" scoped>
.section {
  background-color: #f1f1f1;
  background-image: radial-gradient(rgba(59, 130, 246, 1) 0.9500000000000001px, #f1f1f1 0.9500000000000001px);
  background-size: 19px 19px;
}

.content {
  background-color: #f1f1f1;
}

.breadcrumb {
  box-shadow: 0 2px 0 0 #e7e7e7;
}

.selected {
  @apply bg-blue-100
}
</style>