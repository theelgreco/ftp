<template>
  <div class="w-full max-h-[90%] min-h-[50%] border-1 border-gray-200 dark:border-gray-600 shadow-2xl
                rounded-2xl relative flex flex-col bg-off-white dark:bg-gray-800 p-4 sm:p-10 my-auto">
    <div :class="headerClass">
      <slot name="header"></slot>
      <hr class="mt-5 dark:border-gray-700"/>
    </div>
    <slot name="content"></slot>
  </div>
</template>

<script>
import ServerCard from "@/components/ServerCard.vue";

export default {
  name: "FloatingCard",
  components: {ServerCard},
  props: {
    headerClass:{
      type: String,
      required: false,
      default: "sticky top-0 bg-off-white dark:bg-gray-800 w-full p-3"
    }
  }
}
</script>

<style scoped>

</style>