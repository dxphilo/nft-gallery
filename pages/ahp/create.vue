<template>
  <section>
    <NeoTabs v-model="activeTab" expanded>
      <NeoTabItem v-for="x in components" :key="x" :label="x">
        <component
          :is="x"
          :show-explainer-text="false"
          :class-column="false"
          @navigateToCreateNftTab="switchToNft" />
      </NeoTabItem>
    </NeoTabs>
  </section>
</template>

<script lang="ts">
import { NeoTabItem, NeoTabs } from '@kodadot1/brick'

const Collection = () => import('@/components/create/CreateCollection.vue')
const NFT = () => import('@/components/stmn/Create/CreateToken.vue')

const components = { Collection, NFT, NeoTabItem, NeoTabs }

export default {
  name: 'SttCreatePage',
  components,
  layout: 'centered-half-layout',
  setup() {
    const { activeTab, components, switchToNft } = useCreate()
    return {
      activeTab,
      components,
      switchToNft,
    }
  },
  head() {
    const title = 'Create carbonless NFTs'
    const metaData = {
      title,
      type: 'article',
      description: 'Create carbonless NFTs with low on-chain fees',
      url: '/ahp/create',
      image: `${this.$config.public.baseUrl}/k_card.png`,
    }
    return {
      title,
      link: [
        {
          hid: 'canonical',
          rel: 'canonical',
          href: this.$root.$config.public.baseUrl + this.$route.path,
        },
      ],
      meta: [...this.$seoMeta(metaData)],
    }
  },
}
</script>
