<script setup lang="ts">

const loading = ref(true)
</script>

<template>
  <LayoutCenterPanel
    class="chat-page"
    :loading="loading"
  >
    <div class="chat-workspace">1</div>
  </LayoutCenterPanel>
</template>

<style scoped lang="scss">
.chat-page {
  --center-panel-background: #f7f7f5;
  --center-panel-shadow: none;
  --footer-background: #f7f7f5;
  --footer-border-color: #e6e6e1;
  --footer-padding: 8px 0;
  --footer-font-size: 12px;
  --footer-text-color: #858680;
}

.chat-workspace {
  --chat-background: #f7f7f5;
  --chat-surface: #fff;
  --chat-text: #20201e;
  --chat-muted: #6f706b;
  --chat-border: #deded9;
  --chat-border-strong: #c9cac3;
  --chat-accent: #596b47;
  --chat-accent-hover: #4d5e3d;
  display: grid;
  grid-template-rows: 56px minmax(0, 1fr) auto;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  color: var(--chat-text);
  background: var(--chat-background);
}
</style>
