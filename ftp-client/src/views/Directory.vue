<template>
  <section class="section w-full h-full flex flex-col justify-center select-none">
    <div class="content md:w-[90%] w-[90%] max-h-[90%] min-h-[50%] mx-auto border-1 border-gray-200 shadow-2xl
                rounded-2xl relative flex flex-col">
      <div class="sticky top-0 bg-[#f1f1f1] w-full px-14 pt-6">
        <Breadcrumb :home="home" :model="items" class="bg-[#f1f1f1] breadcrumb pb-3 w-full px-0">
          <template #item="{ item }">
            <div v-if="item.icon" class="cursor-pointer" @mousedown="goTo('/')">
              <i class="mdi mdi-home"/>
            </div>
            <div v-else class="cursor-pointer text-gray-400" @mousedown="goTo(item.path)">
              {{ item.label }}
            </div>
          </template>
        </Breadcrumb>
        <div class="bg-[#f1f1f1] breadcrumb w-full px-0 pt-3 pb-4 flex flex-wrap gap-3">
          <FileUpload mode="basic" name="files" :multiple="true" choose-label="Upload file" :auto="true"
                      custom-upload class="pl-2 pr-3 text-[13px] w-full" upload-icon="mdi mdi-upload"
                      @uploader="uploadFiles"/>
          <Button label="Create folder"
                  class="border-1 border-blue-500 text-blue-500 flex-grow sm:flex-grow-0 pl-2 py-2 pr-3 text-[13px] hover:bg-blue-100"
                  icon="mdi mdi-plus"
                  @click="showCreateFolder"/>
        </div>
      </div>
      <div v-if="files.length" class="flex sm:flex-wrap sm:flex-row flex-nowrap flex-col gap-3 sm:gap-6 w-full h-full overflow-y-auto px-14 pt-6 pb-8"
           ref="directory"
           @mousedown="selectSingleFile"
           @contextmenu="onRightClick">
        <div v-for="file in files" :key="file.name"
             class="item flex flex-row sm:flex-col items-center text-center rounded gap-3 sm:gap-0
                    w-full sm:aspect-square
                    sm:w-[23%] sm:max-w-[100px] p-3
                    hover:bg-blue-50 transition"
             :class="{selected: selected.includes(file)}"
             :title="file.name"
             @contextmenu="e => onRightClick(e, file)"
             @dblclick="handleFileDoubleClick(file)"
             @mousedown="e => selectSingleFile(e, file)"
             @selectionmouseover="e => selectMultipleFiles(e, file, true)"
             @selectionmouseout="e => handleFileDeselect(e, file)">
          <template v-if="file.type === 2">
            <i class="mdi mdi-folder text-3xl sm:text-5xl text-blue-300"/>
            <p class="overflow-hidden text-ellipsis max-w-[100%] text-gray-500 sm:text-[12px] whitespace-nowrap">
              {{ file.name }}
            </p>
          </template>
          <template v-else-if="file.type === 1">
            <i class="mdi mdi-file text-3xl sm:text-5xl text-gray-300"/>
            <p class="text-ellipsis overflow-hidden max-w-[100%] text-gray-500 sm:text-[12px] whitespace-nowrap">
              {{ file.name }}
            </p>
          </template>
        </div>
      </div>
      <div v-else class="mx-auto text-center select-none pointer-events-none px-14 pt-8 pb-8"
           @contextmenu="onRightClick">
        <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-file-10681491-8593307.png"
             style="width: 200px"/>
        <p class="text-gray-400">This folder is empty</p>
      </div>
    </div>
    <ContextMenu ref="menu" :model="fileContextItems" class="select-none">
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
import CreateFolderModal from "@/components/CreateFolderModal.vue";

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
      selectionRect: null,
      metaKeyPressed: false,
      aKeyPressed: false,
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
      return this.selected.filter((file) => {
        return file.type === 1
      }).map((file) => {
        return file.name
      })
    },
    selectedFolderNames() {
      return this.selected.filter((file) => {
        return file.type === 2
      }).map((file) => {
        return file.name
      })
    },
    fileContextItems() {
      const items = [
        {label: `Download (${this.selected.length} selected)`, icon: 'mdi mdi-download', action: this.downloadFiles},
        {label: 'Select all', icon: 'mdi mdi-select-all', action: this.selectAll},
      ]

      if (this.selected.length) {
        items.unshift({
          label: `Delete (${this.selected.length} selected)`,
          icon: 'mdi mdi-delete',
          action: this.deleteFiles
        })
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
      if (e) {
        e.stopPropagation()
        if (e.button === 2) return
        if (e.button === 0 && this.$refs.menu.visible) this.$refs.menu.hide()
      }

      if (!file && (e && !e.shiftKey)) {
        this.deselectAll()
        this.$refs.menu.hide()
      } else if (e && e.shiftKey) {
        this.selectMultipleFiles(e, file)
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
      if (this.selected.includes(file)) {
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

      if (file && !this.selected.includes(file)) {
        this.deselectAll()
        this.selectSingleFile(null, file)
      }

      this.$refs.menu.show(e)
    },
    showCreateFolder() {
      const dialogRef = this.$dialog.open(CreateFolderModal, {
        props: {
          header: 'Create new folder',
          style: {
            width: '400px'
          },
          breakpoints: {
            '960px': '75vw',
            '640px': '90vw'
          },
          modal: true,
          dismissableMask: true,
          blockScroll: true,
          position: "center",
          draggable: false,
        },
        emits: {
          onCreated: (data) => {
            console.log(data)
            dialogRef.close()
          },
        }
      });
    },
    async getFiles() {
      let hasError = null
      let isSuccessful = null

      const path = this.getPathString()

      try {
        this.loading = true

        const {data} = await this.$http.get("/api/files", {params: {path}})
        console.log(data)

        this.cwd = data.path
        this.files = data.files

        isSuccessful = true
      } catch (err) {
        console.error(err)

        if (err.response.data.msg === "That session does not exist!") {
          await router.push("/connect")
        }

        hasError = true
      } finally {
        this.loading = false
        this.error = hasError
        this.success = isSuccessful
      }
    },
    async deleteFiles(e) {
      try {
        if (this.selectedFilenames.length) {
          const {data} = await this.$http.delete("api/files", {
            data: {
              filenames: this.selectedFilenames
            }
          })
          console.log(data)
        }
        if (this.selectedFolderNames.length) {
          const {data} = await this.$http.delete("api/directories", {
            data: {
              dirnames: this.selectedFolderNames
            }
          })
          console.log(data)
        }
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
    async downloadFiles(e) {
      try {
        const response = await this.$http.get("api/files/download", {
          params: {filenames: this.selectedFilenames},
          responseType: 'blob'
        })
        console.log(response)

        const aElement = document.createElement('a');
        const href = URL.createObjectURL(response.data);
        aElement.href = href;

        const filename = response.config.params.filenames[0];

        aElement.setAttribute('download', filename);
        aElement.click();
        URL.revokeObjectURL(href);
      } catch (err) {
        console.error(err)
      }
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
    window.addEventListener("keydown", (e) => {
      e.stopPropagation()

      if (e.key === "Meta") {
        this.metaKeyPressed = true
      }

      if (e.key === "a") {
        this.aKeyPressed = true
      }

      if (this.metaKeyPressed && this.aKeyPressed) {
        this.selectAll()
      }
    })
    window.addEventListener("keyup", (e) => {
      e.stopPropagation()

      if (e.key === "Meta") {
        this.metaKeyPressed = false
      }

      if (e.key === "a") {
        this.aKeyPressed = false
      }
    })
  },
  updated() {
    this.$nextTick(() => {
      if (!this.selectionRect && this.$refs.directory) {
        this.selectionRect = new SelectionRect(this.$refs.directory)
      }
    })
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
  @apply bg-blue-100;
}

.p-fileupload {
  @apply flex-grow;
  @apply sm:flex-grow-0;
}
</style>