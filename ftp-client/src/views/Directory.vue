<template>
  <section class="section w-full h-full flex flex-col justify-center select-none" @click="selectSingleFile">
    <div class="content md:w-[90%] w-[90%] md:p-16 max-h-[90%] min-h-[50%] p-14 mx-auto border-1 border-gray-200 shadow-2xl
                rounded-2xl relative flex flex-col gap-6">
      <div class="sticky top-0 bg-[#f1f1f1] w-full">
        <Breadcrumb :home="home" :model="items" class="bg-[#f1f1f1] breadcrumb pb-3 w-full">
          <template #item="{ item }">
            <div v-if="item.icon" class="cursor-pointer" @mousedown="goTo('/')">
              <i class="mdi mdi-home"/>
            </div>
            <div v-else class="cursor-pointer" @mousedown="goTo(item.path)">
              {{ item.label }}
            </div>
          </template>
        </Breadcrumb>
        <div class="bg-[#f1f1f1] breadcrumb w-full px-4 py-3 flex gap-3">
          <FileUpload mode="basic" name="files" :multiple="true" choose-label="Upload file" :auto="true"
                      custom-upload @uploader="uploadFiles" class="pl-2 pr-3 text-[13px]" upload-icon="mdi mdi-upload"/>
          <Button label="Create folder" icon="mdi mdi-plus"
                  class="border-1 border-blue-500 text-blue-500 pl-2 pr-3 text-[13px] hover:bg-blue-100"/>
        </div>
      </div>
      <div v-if="files.length" class="flex flex-wrap gap-6 w-full h-full overflow-y-auto" @contextmenu="onRightClick">
        <div v-for="file in files" :key="file.name"
             class="item flex flex-col items-center text-center w-[23%] max-w-[100px] p-3 max-h-[100px] rounded
                    hover:bg-blue-50 transition"
             :class="{selected: selected.includes(file)}"
             :title="file.name"
             @contextmenu="e => onRightClick(e, file)"
             @dblclick="handleFileDoubleClick(file)"
             @click="e => selectSingleFile(e, file)"
             @selectionmouseover="e => selectMultipleFiles(e, file, true)"
             @selectionmouseout="e => handleFileDeselect(e, file)">
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
      <div v-else class="mx-auto text-center select-none pointer-events-none" @contextmenu="onRightClick">
        <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-file-10681491-8593307.png"
             style="width: 200px"/>
        <p class="text-gray-400">No files in this directory</p>
      </div>
    </div>
    <ContextMenu ref="menu" :model="fileContextItems">
      <template #item="{ item, props }">
        <div class="p-2 flex gap-2 cursor-pointer" @click="item.action">
          <i :class="item.icon"/>
          <p class="text-gray-500">{{ item.label }}</p>
        </div>
      </template>
    </ContextMenu>
  </section>
</template>

<script>
import Button from "primevue/button";
import Breadcrumb from "primevue/breadcrumb";
import FileUpload from "primevue/fileupload";
import ContextMenu from "primevue/contextmenu";
import router from "@/router/index.js";
import SelectionRect from "@/classes/Drag.js";

export default {
  name: "Directory",
  components: {Breadcrumb, FileUpload, ContextMenu, Button},
  data() {
    return {
      files: [],
      home: {
        icon: 'mdi mdi-home'
      },
      loading: null,
      error: null,
      success: null,
      selected: [],
      cwd: null,
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
    selectedFilenames() {
      const res = []

      this.selected.forEach((file) => {
        res.push(file.name)
      })

      return res
    },
    fileContextItems() {
      const items = [
        {label: 'Select all', icon: 'mdi mdi-select-all', action: this.selectAll},
      ]

      if (this.selected.length) {
        items.unshift({label: 'Delete', icon: 'mdi mdi-delete', action: this.deleteFiles},)
      }

      return items
    }
  },
  methods: {
    getPathString(atIndex) {
      let URL = `/`

      if (this.path.length > 1 || atIndex > 0) {
        URL = atIndex ? URL + `${this.path.slice(1, atIndex + 1).join("/")}` : URL + `${this.path.slice(1).join("/")}/`
      }

      return URL
    },
    selectSingleFile(e, file) {
      e.stopPropagation()

      if (!file) {
        this.deselectAll()
      } else {
        this.selected = [file]
      }
    },
    selectMultipleFiles(e, file) {
      if (!this.selected.includes(file)) {
        this.selected = [...this.selected, file]
      }
    },
    handleFileDeselect(e, file) {
      if (!file) {
        this.deselectAll()
      } else if (this.selected.includes(file)) {
        const index = this.selected.findIndex((el) => el.name === file.name)
        this.selected = this.selected.toSpliced(index, 1)
      }
    },
    handleFileDoubleClick(file) {
      if (file.type === 2) {
        this.goForward(file.name)
      }
    },
    selectAll() {
      this.selected = [...this.files]
    },
    deselectAll() {
      this.selected = []
    },
    onRightClick(e, file) {
      e.stopPropagation()

      if (this.selected.length <= 1 && file) {
        this.deselectAll()
        this.selectSingleFile(e, file)
      }

      this.$refs.menu.show(e)
    },
    async getFiles() {
      let hasError = null
      let isSuccessful = null

      const path = this.getPathString()

      try {
        this.loading = true

        const {data} = await this.$http.get("/api/files", {params: {path}})

        this.cwd = data.path
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
    async deleteFiles(e) {
      try {
        const {data} = await this.$http.delete("api/files", {
          data: {
            filenames: this.selectedFilenames
          }
        })
        console.log(data)
      } catch (err) {
        console.error(err)
      }
    },
    async uploadFiles(e) {
      const {files} = e

      const form = new FormData()

      files.forEach((file) => {
        form.append('files', file)
      })

      const {data} = await this.$http.post('api/files', form, {
        headers: {'Content-Type': 'multipart/form-data'}
      })

      console.log(data)
    },
    async goTo(path) {
      await router.push(`/files${path}`)
    },
    async goForward(directory) {
      const newRoute = this.getPathString()
      await router.push(`/files${newRoute}${directory}`)
    },
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