<script lang="ts">
export default defineComponent({
  name: 'NotFound'
})
</script>

<template>
  <div class="w-full h-full flex item-center justify-center">
    <n-result
      status="404"
      title="404 你什么也找不到"
      description="生活总归带点荒谬"
    >
      <template #footer>
        <n-button>找点乐子吧</n-button>
      </template>
    </n-result>
  </div>
</template>
