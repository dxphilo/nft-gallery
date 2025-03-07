import { defineStore } from 'pinia'
import { AssetListQueryResponse } from '@/components/bsx/Asset/types'
import assetListQuery from '@/queries/subsquid/bsx/assetList.graphql'
import { chainAssetOf } from '@/utils/config/chain.config'
import { useApollo } from '@/utils/config/useApollo'
import type { Prefix } from '@kodadot1/static'

export type TokenProperty = {
  id: string
  decimals: number
  symbol: string
}

type TokenMap = Record<string, TokenProperty>

export const useAssetsStore = defineStore('assets', {
  state: (): { tokenMap: TokenMap; localPrefix: Prefix | null } => ({
    tokenMap: {},
    localPrefix: null,
  }),
  getters: {
    getAssetList: (state) => state.tokenMap,
    getAssetById: (state) => (id: string) =>
      state.tokenMap[id] || { id, decimals: 12, symbol: 'Unit' },
  },
  actions: {
    setAssetList(payload) {
      this.tokenMap = Object.assign({}, this.tokenMap, payload)
    },
    setLocalPrefix(payload: Prefix) {
      this.localPrefix = payload
    },
    async fetchAssetList() {
      const { $apollo } = useNuxtApp()
      const { urlPrefix } = usePrefix()
      if (this.localPrefix === urlPrefix.value) {
        return
      }
      this.setLocalPrefix(urlPrefix.value)
      const { assetList } = await useApollo<any, AssetListQueryResponse>(
        $apollo as any,
        urlPrefix.value,
        assetListQuery
      ).catch(() => ({
        assetList: [chainAssetOf(urlPrefix.value)],
      }))

      const tokenMap: TokenMap = Object.fromEntries(
        assetList.map(({ id, decimals, symbol }) => [
          id,
          { id, decimals, symbol },
        ])
      )
      this.setAssetList(tokenMap)
      return
    },
  },
})
