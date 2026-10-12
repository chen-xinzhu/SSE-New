<script lang="ts" setup>
</script>


<template>
  <LayoutSlotCenterPanel v-bind="$attrs">
    <template
      v-if="$slots.sidebar"
      #left
    >
    </template>
    <div
      h-full
      class="center-panel-surface"
    >
      <slot name="default"></slot>
    </div>
  </LayoutSlotCenterPanel>
</template>
