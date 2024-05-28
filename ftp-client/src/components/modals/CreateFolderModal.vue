<template>
  <div class="flex flex-col gap-2">
    <small id="username-help">Enter the name of the new folder.</small>
    <InputText id="username" v-model="value" aria-describedby="username-help" class="border-1 p-1"
               @keydown.enter="createFolder"/>
    <Button label="Create" :disabled="!value"
            @click="createFolder"
            class="bg-blue-400 ml-auto mt-2 px-5 py-2 w-fit text-[13px] text-white hover:bg-blue-500 transition"/>
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";

export default {
  name: "CreateFolderModal",
  emits: ["create"],
  components: {InputText, Button},
  data() {
    return {
      value: ""
    }
  },
  methods: {
    async createFolder() {
      if (this.value) {
        this.$emit("create", this.value)
      }
    }
  }
}
</script>

<style scoped>

</style>