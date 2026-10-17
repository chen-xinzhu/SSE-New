<script setup lang="tsx">
import type { CrossTransformFunction, TransformFunction } from './models'
import { sleep } from '@/utils/request'

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

const isAbort = ref(false)

const isCompleted = ref(false)

const emit = defineEmits(['failed'])

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


</script>

<template>
  <div class="markdown"></div>
</template>

<style scoped lang="scss">
@use './styles/index.scss'
</style>
