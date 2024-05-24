<template>
  <div class="flex flex-col gap-2">
    <small id="username-help">Rename to:</small>
    <InputText id="username" v-model="value" aria-describedby="username-help" class="border-1 p-1"
               @keydown.enter="rename"/>
    <Button label="Create" :disabled="!value"
            @click="rename"
            class="bg-blue-400 ml-auto mt-2 px-5 py-2 w-fit text-[13px] text-white hover:bg-blue-500 transition"/>
  </div>
</template>

<script>
import {inject} from 'vue';
import InputText from "primevue/inputtext";
import Button from "primevue/button";

export default {
  name: "RenameFileModal",
  emits: ["rename"],
  components: {InputText, Button},
  data() {
    return {
      value: "",
    }
  },
  methods: {
    rename() {
      if (this.value) {
        this.$emit('rename', this.value)
      }
    }
  },
  setup() {
    const dialogRef = inject('dialogRef');

    return {
      dialogData: dialogRef.value.data
    };
  },
  mounted() {
    this.value = this.dialogData.filename
  }
}
</script>

<style scoped>

</style>