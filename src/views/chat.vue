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
          <CustomTooltip>
            <template #trigger>
              <button
                type="button"
                class="chat-help-button"
                aria-label="查看模型使用说明"
              >
                <span
                  class="i-lucide:circle-help"
                  aria-hidden="true"
                ></span>
              </button>
            </template>

            <!-- tooltip 内容 -->
            <div>注意：</div>
            <div>演示环境仅支持 “模拟数据模型”</div>
            <div>
              如需测试其他模型请克隆<a
                href="https://github.com/pdsuwwz/chatgpt-vue3-light-mvp"
                target="_blank"
                rel="noreferrer"
                class="repo-help-link"
              >本仓库</a>到本地运行
            </div>
          </CustomTooltip>
        </div>
      </header>

      <main class="chat-response-region"></main>

      <section
        class="chat-composer-zone"
        aria-label="消息输入"
      >
        <div class="chat-composer-inner">
          <div
            class="prompt-suggestions"
            aria-label="建议问题"
          ></div>
        </div>
      </section>
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

.chat-model-select {
  width: 252px;
  :deep(.n-base-selection) {
    --n-border-radius: 7px !important;
    --n-border: 1px solid var(--chat-border) !important;
    --n-border-hover: 1px solid var(--chat-border-strong) !important;
    --n-border-active: 1px solid var(--chat-accent) !important;
    --n-box-shadow-active: 0 0 0 2px rgb(89 107 71 / 12%) !important;
    --n-box-shadow-focus: 0 0 0 2px rgb(89 107 71 / 12%) !important;
    --n-color: var(--chat-surface) !important;
    --n-text-color: var(--chat-text) !important;
    min-height: 36px;
    font-size: 13px;
  }
}

.chat-help-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  color: var(--chat-muted);
  font-size: 18px;
  cursor: help;
  background: transparent;
  transition: color 150ms ease, background-color 150ms ease;

  &:hover {
    color: var(--chat-text);
    background: #eeeeea;
  }

  &:focus-visible {
    outline: 2px solid rgb(89 107 71 / 38%);
    outline-offset: 1px;
  }
}

.repo-help-link {
  padding: 0 2px;
  color: #d5e7c2;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #b9d29f;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 3px;
  transition: color 150ms ease, text-decoration-color 150ms ease;

  &:hover,
  &:focus-visible {
    color: #fff;
    text-decoration-color: #fff;
  }
}

.chat-response-region {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.chat-composer-zone {
  min-width: 0;
  padding: 8px 24px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid #e8e8e3;
  background: var(--chat-background);
}
</style>
