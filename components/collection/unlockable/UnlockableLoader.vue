<template>
  <NeoLoading :active.sync="isLoading" is-full-page :can-cancel="canCancel">
    <div class="loading-container py-2">
      <NeoIcon class="close-icon" icon="close" @click.native="closeLoading" />
      <img src="/unlockable-loader.svg" />
      <div
        class="is-flex is-flex-direction-column is-align-items-center px-5 has-text-centered is-capitalized">
        <div class="has-text-weight-bold mb-2">{{ $t('mint.success') }}</div>
        <div>
          {{ $t('mint.unlockable.loader.viewNFT1') }}
          <span v-if="minted">
            {{ $t('mint.unlockable.loader.viewNFTNow2') }}
            <span class="has-text-weight-bold">
              {{ $t('mint.unlockable.loader.viewNFTNow3') }}</span
            >
          </span>
          <span v-else>
            {{ $t('mint.unlockable.loader.viewNFTLater2') }}
            <span class="has-text-weight-bold">
              {{ displaySeconds }}
              {{ $t('mint.unlockable.loader.viewNFTLater3') }}
            </span>
          </span>
        </div>
        <div class="mt-4">
          {{ $t('mint.unlockable.loader.shareSuccess') }}
          <a v-safe-href="postTwitterUrl" target="_blank" class="has-text-link"
            >{{ $t('mint.unlockable.loader.onTwitter') }}
          </a>
        </div>
        <NeoButton
          class="mb-2 mt-4 loading-button is-size-6"
          variant="secondary"
          tag="nuxt-link"
          :to="`/${urlPrefix}/gallery/${minted}`"
          :disabled="!minted"
          :label="buttonLabel" />
      </div>
    </div>
  </NeoLoading>
</template>

<script lang="ts" setup>
import { NeoButton, NeoIcon, NeoLoading } from '@kodadot1/brick'

const props = withDefaults(
  defineProps<{
    value: boolean
    canCancel?: boolean
    minted?: string
  }>(),
  {
    value: false,
    canCancel: true,
    minted: '',
  }
)
const { urlPrefix } = usePrefix()
const { $i18n } = useNuxtApp()
const isLoading = useVModel(props, 'value')
import { useCountDown } from './utils/useCountDown'

const COUNT_DOWN_SECONDS = 51
const { seconds } = useCountDown(
  new Date().getTime() + COUNT_DOWN_SECONDS * 1000
)

const displaySeconds = computed(() => {
  return seconds.value >= 0 ? seconds.value : 'few'
})

const twitterText = computed(
  () =>
    'Just minted an exclusive NFT with unlockable items on @Kodadot! 🎉 So excited to add this unique collectible to my collection. Do not miss your chance! \n\n https://kodadot.xyz/ahk/drops/free-drop'
)
const postTwitterUrl = computed(
  () =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      twitterText.value
    )}`
)
const emit = defineEmits(['input'])

const closeLoading = () => {
  emit('input', false)
}
const buttonLabel = computed(() =>
  $i18n.t(
    props.minted ? 'mint.unlockable.viewItem' : 'mint.unlockable.preparing'
  )
)
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';

.loading-container {
  background: $white;
  backdrop-filter: $frosted-glass-backdrop-filter;
  margin: 0rem 1rem;
  width: 385px;
  min-height: 356px;

  @include ktheme() {
    box-shadow: theme('primary-shadow');
    border: 1px solid theme('border-color');
    background: theme('background-color');
  }
  .close-icon {
    position: absolute;
    right: 28px;
    top: 17px;
    cursor: pointer;
  }
  .loading-button {
    height: 35px;
    min-width: 126px;
  }
}
</style>
