<template>
  <div class="p-3 w-full h-fit md:w-1/2 lg:w-1/3">
    <div class="p-5 border-1 w-full h-fit border-blue-400 flex flex-col gap-1 rounded overflow-hidden hover:shadow-lg
                dark:hover:shadow-blue-900 dark:hover:shadow-md cursor-pointer transition dark:bg-gray-800">
      <span class="mb-3 overflow-hidden text-ellipsis">
        <i class="mdi mdi-web mr-1 text-gray-400"/><span class="font-bold dark:text-white">{{ server.host }}</span>
      </span>
      <div>
        <p class="text-gray-400 text-[9px]">Username</p>
        <p class="text-[12px] dark:text-white">{{ server.user }}</p>
      </div>
      <div>
        <p class="text-gray-400 text-[9px]">Password</p>
        <p class="mt-1 text-[12px] dark:text-white">*********</p>
      </div>
      <div class="mt-[-0.25rem]">
        <p class="text-gray-400 text-[9px]">Port</p>
        <p class="text-[12px] dark:text-white">{{ server.port }}</p>
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
                @click="$emit('delete')"/>
        <Button label="Connect"
                class="border-1 border-blue-500 text-blue-500 pl-3 py-2 pr-2 text-[13px] hover:bg-blue-50
                       active:bg-blue-100 dark:hover:bg-gray-900 dark:active:bg-gray-950 ml-auto"
                icon="mdi mdi-chevron-right"
                icon-pos="right"
                @click="$emit('connect')"/>
      </div>
    </div>
  </div>
</template>

<script>
import Button from "primevue/button";

export default {
  name: "ServerCard",
  components: {Button},
  emits: ["connect", "delete"],
  props: {
    server: {
      types: Object,
      required: true
    }
  },
}
</script>

<style scoped>

</style>