<template>
  <section class="section w-full h-full flex flex-col justify-center select-none">
    <div class="content md:w-[90%] w-[90%] md:p-16 p-14 mx-auto border-1 border-gray-200 shadow-2xl rounded-2xl
                overflow-y-auto relative flex flex-col gap-6">
      <Breadcrumb :home="home" :items="items"/>
      <div class="flex flex-wrap gap-6" v-if="files.length">
        <div v-for="file in files">
          <template class="flex flex-col items-center">
            <div v-if="file.type === 2">
              <i class="mdi mdi-folder"/>
              <p>{{ file.name }}</p>
            </div>
            <div v-else-if="file.type === 1">
              <i class="mdi mdi-folder"/>
              <p>{{ file.name }}</p>
            </div>
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

export default {
  name: "Home",
  components: {Breadcrumb},
  data() {
    return {
      files: [],
      home: {
        icon: 'mdi mdi-home'
      },
      items: [],
      loading: null,
      error: null,
      success: null
    }
  },
  async created() {
    let hasError = null
    let isSuccessful = null

    try {
      this.loading = true
      const {data} = await this.$http.get("/api/files")
      this.files = data.files
      console.log(data.cwd)
      isSuccessful = true
    } catch (err) {
      console.error(err)
      hasError = true
    } finally {
      this.loading = false
      this.error = hasError
      this.success = isSuccessful
    }
  }
}
</script>


<style scoped>
.section {
  background-color: #f1f1f1;
  background-image: radial-gradient(rgba(59, 130, 246, 1) 0.9500000000000001px, #f1f1f1 0.9500000000000001px);
  background-size: 19px 19px;
}

.content {
  background-color: #f1f1f1;
}
</style>