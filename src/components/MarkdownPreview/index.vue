<script setup lang="tsx">
import type { CrossTransformFunction, TransformFunction } from './models'
import { sleep } from '@/utils/request'
import { defaultMockModelName } from './models'

interface Props {
  reader?: ReadableStreamDefaultReader<Uint8Array> | null | undefined
  model: string | null | undefined
  transformStreamFn: TransformFunction | null | undefined
  contentClass?: string
}

const props = withDefaults(
  defineProps<Props>(),
  {
    reader: null,
    contentClass: ''
  }
)

/**
 * 相关响应式变量
 */
const displayText = ref('')
const textBuffer = ref('')
const readerLoading = ref(false)

const isAbort = ref(false)

const isCompleted = ref(false)

// 接口响应是否正在排队等待
const waitingForQueue = ref(false)

const WaitTextRender = defineComponent({
  setup() {
    return () => {
      <n-empty
        size="large"
        class="font-bold [&_.n-empty\_\_icon]:flex [&_.n-empty\_\_icon]:justify-center">
        {{
          default: () => (
            <div
              whitespace-break-spaces
              text-center
            >请求排队处理中，请耐心等待...</div>
          ),
          icon: () => (
            <n-icon class="text-30">
              <div class="i-svg-spinners:clock"></div>
            </n-icon>
          ),
          extra: ()=>( <n-button size="small">
            看看别的
          </n-button>)
        }}
      </n-empty>
    }
  }
})

/**
 * 检查是否有实际内容
 */
function hasActualContent(html) {
  const text = html.replace(/<[^>]*>/g, '')
  return /\S/.test(text)
}

const showCopy = computed(() => {
  if (!isCompleted.value) return false

  if (hasActualContent(displayText.value)) {
    return true
  }
  return false
})

/**
 * 是否初始化
 */
const initialized = ref(false)

const initializeStart = () => {
  initialized.value = true
}

const initializeEnd = () => {
  initialized.value = false
}

/**
 * n-spin是否显示整个main加载
 */

const showLoading = computed(() => {
  if (initialized.value) {
    return true
  }

  if (!props.reader) {
    return false
  }

  if (!readerLoading) {
    return false
  }
  if (displayText.value) {
    return false
  }

  return false
})

const clipBoardRef = ref()
const handlePassClip = () => {
  if (clipBoardRef.value) {
    clipBoardRef.value.copyText()
  }
}

const emptyPlaceholder = computed(() => {
  return defaultMockModelName === props.model
    ? '当前为模拟环境\n随便问一个问题，我才会消失 ~'
    : '问一个问题，我才会消失 ~'
})

</script>

<template>
  <n-spin
    relative
    flex="1 ~"
    min-h-0
    w-full
    h-full
    content-class="w-full h-full flex"
    :show="showLoading"
    :rotate="false"
    class="markdown-preview bg-#fff:30"
    :class="contentClass"
    :style="{
      '--n-opacity-spinning': '0.3'
    }"
  >
    <transition name="fade">
      <n-float-button
        v-if="true"
        position="absolute"
        :top="30"
        :right="30"
        color
        aria-label="复制回答"
        class="markdown-copy-action c-warning bg-#fff/80 hover:bg-#fff/90 transition-all-200 z-2"
        @click="handlePassClip()"
      >
        <clip-board
          ref="clipBoardRef"
          :auto-color="false"
          no-copy
          :text="displayText"
        />
      </n-float-button>
    </transition>
    <template #icon>
      <div class="i-svg-spinners:3-dots-rotate"></div>
    </template>
  </n-spin>
</template>

<style scoped lang="scss">
@use './styles/index.scss'
</style>
