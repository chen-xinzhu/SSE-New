<script setup lang="tsx">
import { renderMarkdownText, renderMermaidProcess } from './plugins/markdown'
import type { CrossTransformFunction, TransformFunction } from './models'
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

const emit = defineEmits([
  'failed',
  'completed',
  'update:reader'
])


const refWrapperContent = ref<HTMLElement>()

let typingAnimationFrame: number | null = null


/**
 * 渲染后的Markdown内容
 */
const renderedMarkdown = computed(() => {
  return renderMarkdownText(displayText.value)
})

const renderedContent = computed(() => {
  // 在 renderedMarkdown 末尾插入光标标记
  return `${ renderedMarkdown.value }`
})


/**
 * 是否正在等待排队
 */
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
 * 终止
 */
const abortReader = () => {
  if (props.reader) {
    props.reader.cancel()
  }

  isAbort.value = true
  readIsOver.value = false
  emit('update:reader', null)
  initializeEnd()
  isCompleted.value = true
}


/**
 * 重置状态
 */
const resetStatus = () => {
  isAbort.value = false
  isCompleted.value = false
  readIsOver.value = false

  emit('update:reader', null)

  initializeEnd()
  displayText.value = ''
  textBuffer.value = ''
  readerLoading.value = false
  if (typingAnimationFrame) {
    cancelAnimationFrame(typingAnimationFrame)
    typingAnimationFrame = null
  }
}


/**
 * 重点
 * 1.reader 读取是否结束
 * 2.reader.read() 读取到内容存入 textBuffer中
 */
const readIsOver = ref(false)
const readTextStream = async () => {
  if (!props.reader) return

  const textDecoder = new TextDecoder('utf-8')
  readerLoading.value = true

  while (true) {
    if(isAbort.value) {
      break
    }
    try {
      if (!props.reader) {
        readIsOver.value = true
        break
      }

      const { value, done } = await props.reader.read()
      if (!props.reader) {
        readIsOver.value = true
        break
      }
      if (done) {
        readIsOver.value = true
        break
      }

      const transformer = props.transformStreamFn as CrossTransformFunction
      if(!transformer) {
        break
      }

      const stream = transformer(value, textDecoder)
      if (stream.done) {
        readIsOver.value = true
        break
      }
      if(stream.isWaitQueuing) {
        waitingForQueue.value = stream.isWaitQueuing
      }
      if (stream.content) {
        waitingForQueue.value = false
        textBuffer.value += stream.content
      }

      //这是第一次启动
      if(typingAnimationFrame === null) {
        showText()
      }

    } catch (error) {
      readIsOver.value = true
      emit('failed', error)
      resetStatus()
      break
    } finally {
      initializeEnd()
    }
  }
}


/**
 * 重点
 * 1.智能滚动, 支持生成时可以滚动
 */
const scrollToBottom = async () => {
  await nextTick()
  if (!refWrapperContent.value) return
  // 当给了一个不合理的值, 会直接到达最底部
  refWrapperContent.value.scrollTop = refWrapperContent.value.scrollHeight
}
const scrollToBottomByThreshold = async () => {
  if (!refWrapperContent.value) return

  const threshold = 100
  const distanceToBottom = refWrapperContent.value.scrollHeight - refWrapperContent.value.scrollTop - refWrapperContent.value.clientHeight
  if (distanceToBottom <= threshold) {
    scrollToBottom()
  }
}
const scrollToBottomIfAtBottom = async () => {
  // TODO: 需要同时支持手动向上滚动
  scrollToBottomByThreshold()
}


/**
 * 重点
 * 1.buffterText逐字追加到displayText
 * 2.帧生成api, 打字动画
 */
const runReadBuffer = (readCallback = () => { }, endCallback = () => { }) => {
  if(textBuffer.value.length > 0) {
    const nextChunk = textBuffer.value.substring(0, 10)
    displayText.value += nextChunk
    textBuffer.value = textBuffer.value.substring(10)
    readCallback()
  } else {
    endCallback()
  }
}

const showText = () => {
  if (isAbort.value && typingAnimationFrame) {
    cancelAnimationFrame(typingAnimationFrame)
    typingAnimationFrame = null
    readerLoading.value = false
    renderMermaidProcess(scrollToBottom)
    return
  }

  if (!readIsOver.value) {
    runReadBuffer()
    renderMermaidProcess(scrollToBottom)
    //嵌套循环
    typingAnimationFrame = requestAnimationFrame(showText)
  } else {
    runReadBuffer(
      //确认搬空textbuffter
      () => {
        renderMermaidProcess(scrollToBottom)
        typingAnimationFrame = requestAnimationFrame(showText)
      },
      () => {
        renderMermaidProcess(scrollToBottom)

        window.$ModalNotification.success({
          title: '生成完毕',
          duration: 1500
        })
        emit('update:reader', null)
        emit('completed')
        readerLoading.value = false
        isCompleted.value = true
        nextTick(() => {
          readIsOver.value = false
        })
        typingAnimationFrame = null
      }
    )
  }
  scrollToBottomIfAtBottom()
}


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


watch(
  () => props.reader,
  () => {
    if (props.reader) {
      readTextStream()
    }
  },
  {
    immediate: true,
    deep: true
  }
)

onUnmounted(() => {
  resetStatus()
})

defineExpose({
  abortReader,
  resetStatus,
  initializeStart,
  initializeEnd
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
        v-if="showCopy"
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
    <div
      flex="1 ~"
      min-w-0
      min-h-0
      :class="[
        reader
          ? ''
          : 'justify-center items-center'
      ]"
    >
      <div
        text-16
        class="w-full h-full overflow-hidden"
        :class="[
          !displayText && 'flex items-center justify-center'
        ]"
      >
        <!-- 排队加载 -->
        <WaitTextRender
          v-if="waitingForQueue && !displayText"
        />
        <template v-else>
          <n-empty
            v-if="!displayText"
            size="large"
            class="markdown-empty-state font-bold"
          >
            <div
              whitespace-break-spaces
              text-center
              v-html="emptyPlaceholder"
            ></div>
            <template #icon>
              <n-icon>
                <div class="i-hugeicons:ai-chat-02"></div>
              </n-icon>
            </template>
          </n-empty>
          <div
            v-else
            ref="refWrapperContent"
            text-16
            class="markdown-content-scroller w-full h-full min-w-0 overflow-y-auto"
            p-24px
          >
            <div
              class="markdown-wrapper"
              v-html="renderedContent"
            ></div>
            <WaitTextRender
              v-if="waitingForQueue"
            />
            <div
              v-if="readerLoading"
              class="markdown-stream-status"
              aria-label="正在生成回答"
              role="status"
            >
              <div
                size-24
                class="i-svg-spinners:pulse-3"
                aria-hidden="true"
              ></div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </n-spin>
</template>

<style scoped lang="scss">
@use './styles/index.scss'
</style>
