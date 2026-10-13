import { defineStore } from 'pinia'

import { defaultModelName, modelMappingList } from '@/components/MarkdownPreview/models'


export interface BusinessState {
  systemModelName: string
}

export const useBusinessStore = defineStore('business', {
  state: (): BusinessState => {
    return {
      systemModelName: defaultModelName
    }
  }
})
