<script setup lang="ts">
import { defaultMockModelName, modelMappingList } from '@/components/MarkdownPreview/models'
import type { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import { systemTitle } from '@/base'
import { isGithubDeployed } from '@/config'

const loading = ref(true)

setTimeout(() => {
  loading.value = false
}, 700)


const stylizingLoading = ref(false)

const modelListSelections = computed(() => {
  return modelMappingList.map<SelectBaseOption>((modelItem) => {
    let disabled = false
    if (isGithubDeployed && modelItem.modelName !== defaultMockModelName) {
      disabled = true
    }

    return {
      label: modelItem.label,
      value: modelItem.modelName,
      // Github 演示环境禁用模型切换，拉取代码后可按自己需求修改
      disabled
    }
  })
})

const businessStore = useBusinessStore()
</script>

<template>
  <LayoutCenterPanel
    class="chat-page"
    :loading="loading"
  >
    <div class="chat-workspace">
      <header class="chat-toolbar">
        <a
          class="chat-brand"
          href="https://github.com/pdsuwwz/chatgpt-vue3-light-mvp"
          target="_blank"
          rel="noreferrer"
          :aria-label="`${systemTitle}，打开项目仓库`"
        >
          <span
            class="chat-brand-icon i-lucide:message-square-text"
            aria-hidden="true"
          ></span>
          <span class="chat-brand-title">{{ systemTitle }}</span>
        </a>

        <div class="chat-toolbar-actions">
          <span class="chat-model-label">当前模型</span>
          <n-select
            v-model:value="businessStore.systemModelName"
            class="chat-model-select"
            placeholder="请选择模型"
            :disabled="stylizingLoading"
            :options="modelListSelections"
          />
        </div>
      </header>
    </div>
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

.chat-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-width: 0;
  padding: 0 24px;
  border-bottom: 1px solid var(--chat-border);
  background: rgb(255 255 255 / 76%);
}

.chat-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--chat-text);
  transition: color 150ms ease;

  &:hover {
    color: var(--chat-accent);
  }

  &:focus-visible {
    outline: 2px solid rgb(89 107 71 / 38%);
    outline-offset: 4px;
    border-radius: 4px;
  }
}

.chat-brand-icon {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
}

.chat-brand-title {
  overflow: hidden;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-toolbar-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.chat-model-label {
  margin-right: 2px;
  color: var(--chat-muted);
  font-size: 13px;
}
</style>
