<template>
  <FloatingCard>
    <template v-slot:header>
      <Breadcrumb :home="home" :model="items" class="bg-off-white dark:text-white dark:bg-gray-800 pb-3 sm:pt-0 w-full px-0">
        <template #item="{ item }">
          <div v-if="item.icon" class="cursor-pointer" @mousedown="goTo('/')">
            <i class="mdi mdi-home"/>
          </div>
          <div v-else class="cursor-pointer text-gray-400" @mousedown="goTo(item.path)">
            {{ item.label }}
          </div>
        </template>
      </Breadcrumb>
      <div class="bg-off-white dark:bg-gray-800 w-full px-0 pt-3 flex flex-wrap gap-3">
        <FileUpload mode="basic" name="files" :multiple="true" choose-label="Upload file" :auto="true"
                    custom-upload class="pl-2 pr-3 text-[13px] w-full" upload-icon="mdi mdi-upload"
                    @uploader="uploadFiles"/>
        <Button label="Create folder"
                class="border-1 border-blue-500 text-blue-500 flex-grow sm:flex-grow-0 pl-2 py-2 pr-3 text-[13px]
                         hover:bg-blue-100 dark:hover:bg-gray-900 dark:active:bg-gray-950"
                icon="mdi mdi-plus"
                @click="showCreateFolder"/>
      </div>
    </template>
    <template v-slot:content>
      <div v-if="files.length"
           class="flex sm:flex-wrap sm:flex-row flex-nowrap flex-col gap-3 sm:gap-6 w-full h-full overflow-y-auto
                  px-3 pt-3 pb-8 dark:bg-gray-800 rounded-b-2xl select-none"
           ref="directory"
           @mousedown="selectSingleFile"
           @contextmenu="onRightClick">
        <div v-for="file in files" :key="file.name"
             class="item flex flex-row sm:flex-col items-center text-center rounded gap-3 sm:gap-0 h-fit w-full
                    sm:aspect-square sm:w-[23%] sm:max-w-[100px] p-3 hover:bg-blue-50 transition dark:hover:bg-gray-700"
             :class="{selected: selected.includes(file)}"
             :title="file.name"
             @contextmenu="e => onRightClick(e, file)"
             @dblclick="handleFileDoubleClick(file)"
             @mousedown="e => selectSingleFile(e, file)"
             @selectionmouseover="e => selectMultipleFiles(e, file, true)"
             @selectionmouseout="e => handleFileDeselect(e, file)">
          <template v-if="file.type === 2">
            <i class="mdi mdi-folder text-3xl sm:text-5xl text-blue-300"/>
            <p class="overflow-hidden text-ellipsis max-w-[100%] text-gray-500 dark:text-white sm:text-[12px]
                      whitespace-nowrap">
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
      <div v-else class="mx-auto text-center select-none pointer-events-none px-6 sm:px-14 pt-8 pb-8 dark:bg-gray-800"
           @contextmenu="onRightClick">
        <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-file-10681491-8593307.png"
             style="width: 200px" alt="no-files"/>
        <p class="text-gray-400">This folder is empty</p>
      </div>
    </template>
  </FloatingCard>
  <ContextMenu ref="menu" :model="fileContextItems" class="select-none">
    <template #item="{ item, props }">
      <div class="p-2 flex gap-2 cursor-pointer" @click="item.action">
        <i :class="item.icon"/>
        <p class="text-gray-500">{{ item.label }}</p>
      </div>
    </template>
  </ContextMenu>
</template>

<script>
import Button from "primevue/button";
import Breadcrumb from "primevue/breadcrumb";
import FileUpload from "primevue/fileupload";
import ContextMenu from "primevue/contextmenu";

import router from "@/router/index.js";
import SelectionRect from "@/classes/Drag.js";
import CreateFolderModal from "@/components/modals/CreateFolderModal.vue";
import RenameFileModal from "@/components/modals/RenameFileModal.vue";
import FloatingCard from "@/components/FloatingCard.vue";

const typeLookup = {
  1: "file",
  2: "folder"
}

export default {
  name: "Directory",
  components: {FloatingCard, Breadcrumb, FileUpload, ContextMenu, Button},
  data() {
    return {
      _files: [],
      home: {
        icon: 'mdi mdi-home'
      },
      server: null,
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
    files() {
      if (this._files.length) {
        return this._files.map((file) => {
          file.extension = this.getFileExtension(file.name)
          return file
        }).toSorted((a, b) => {
          return a.name.localeCompare(b.name)
        })
      }
      return []
    },
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
        {label: `Download (${this.selected.length})`, icon: 'mdi mdi-download', action: this.downloadFiles},
        {label: 'Select all', icon: 'mdi mdi-select-all', action: this.selectAll},
      ]

      if (this.selected.length) {
        items.unshift({
          label: `Delete (${this.selected.length})`,
          icon: 'mdi mdi-delete',
          action: this.deleteFiles
        })
      }

      if (this.selected.length === 1) {
        items.unshift({
          label: `Rename ${typeLookup[this.selected[0].type]}`,
          icon: 'mdi mdi-pencil',
          action: this.showRenameFile
        })
      }

      return items
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
          onCreate: async (data) => {
            await this.createFolder(data)
            dialogRef.close()
            window.location.reload()
          },
        }
      });
    },
    showRenameFile() {
      const dialogRef = this.$dialog.open(RenameFileModal, {
        props: {
          header: `Rename ${typeLookup[this.selected[0].type]}`,
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
        data: {
          filename: this.removeFileExtension(this.selected[0].name)
        },
        emits: {
          onRename: async (data) => {
            if (`${data}.${this.selected[0].extension}` !== this.selected[0].name) {
              await this.renameFiles(data)
            }
            dialogRef.close()
          },
        }
      });
    },
    getFileExtension(filename) {
      return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    },
    removeFileExtension(filename) {
      let extension = `${this.getFileExtension(filename)}`

      if (extension) {
        extension = `.${extension}`
        const index = filename.lastIndexOf(extension)
        return filename.slice(0, index)
      }

      return filename
    },
    async getFiles() {
      let hasError = null
      let isSuccessful = null

      const path = this.getPathString()

      try {
        this.loading = true

        const {data} = await this.$http.get(`api/servers/${this.server}/files`, {params: {path}})

        this.cwd = data.path
        this._files = data.files

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
        if (this.selectedFilenames.length) {
          const {data} = await this.$http.delete(`api/servers/${this.server}/files`, {
            data: {
              path: this.cwd,
              filenames: this.selectedFilenames
            }
          })
          console.log(data)
        }
        if (this.selectedFolderNames.length) {
          const {data} = await this.$http.delete(`api/servers/${this.server}/directories`, {
            data: {
              path: this.cwd,
              dirnames: this.selectedFolderNames
            }
          })
          console.log(data)
        }
        if (this.selected.length) {
          window.location.reload()
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

      form.append('path', this.cwd)

      try {
        const {data} = await this.$http.post(`api/servers/${this.server}/files`, form, {
          headers: {'Content-Type': 'multipart/form-data'}
        })

        console.log(data)
        window.location.reload()
      } catch (err) {
        console.error(err)
      }
    },
    async downloadFiles(e) {
      try {
        const blobs = []

        for (let i = 0; i < this.selectedFilenames.length; i++) {
          const response = await this.$http.get(`api/servers/${this.server}/files/download`, {
            params: {filename: this.selectedFilenames[i], path: this.cwd},
            responseType: 'blob'
          })

          const aElement = document.createElement('a');
          const href = URL.createObjectURL(response.data);
          aElement.href = href;

          const filename = response.config.params.filename;

          aElement.setAttribute('download', filename);

          blobs.push({href, aElement})
        }

        blobs.forEach((blob) => {
          blob.aElement.click();
          URL.revokeObjectURL(blob.href);
        })
      } catch (err) {
        console.error(err)
      }
    },
    async renameFiles(newFilename, newLocation = "") {
      const filename = this.selected[0].name
      const extension = this.selected[0].extension

      const currentPath = `${this.cwd}${filename}`
      let newPath = `${this.cwd}${newLocation}${newFilename}`

      if (extension) newPath = `${newPath}.${extension}`

      try {
        const {data} = await this.$http.post(`api/servers/${this.server}/files/rename`, {currentPath, newPath})
        window.location.reload()
      } catch (err) {
        console.error(err)
      }
    },
    async createFolder(folderName) {
      try {
        const {data} = await this.$http.post(`api/servers/${this.server}/directories`,
            {
              path: `${this.cwd}${folderName}`
            }
        )
      } catch (err) {
        console.error(err)
      }
    },
    async goTo(path) {
      await router.push(`/${this.server}${path}`)
    },
    async goForward(directory) {
      const newRoute = this.getPathString()
      await router.push(`/${this.server}${newRoute}${directory}`)
    },
  },
  async created() {
    this.server = this.$route.params.server
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
.selected {
  @apply bg-blue-100 dark:bg-gray-600;
}

.p-fileupload {
  @apply flex-grow;
  @apply sm:flex-grow-0;
}
</style>