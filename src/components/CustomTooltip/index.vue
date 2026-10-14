<script lang="ts" setup></script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <slot name="trigger"></slot>
    </template>
    <slot></slot>
  </n-tooltip>
</template>
