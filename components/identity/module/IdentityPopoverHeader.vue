<template>
  <div class="popover-header pb-2">
    <h6 class="popover-user-heading">{{ $t('user') }}</h6>
    <div class="is-flex is-align-items-center is-justify-content-space-between">
      <div class="is-flex is-align-items-center">
        <nuxt-link
          class="is-size-6 break-word mr-2 has-text-link"
          :to="`/${urlPrefix}/u/${address}`">
          <span data-cy="identity-display">
            {{ identity?.display || shortenedAddress }}</span
          >
        </nuxt-link>
        <NeoIcon
          v-clipboard:copy="address"
          icon="copy"
          class="has-text-link is-clickable"
          data-cy="identity-clipboard"
          @click.native="toast('Copied to clipboard')" />
      </div>
      <a
        v-if="identity?.twitter"
        v-safe-href="`https://twitter.com/${identity?.twitter}`"
        target="_blank"
        rel="nofollow noopener noreferrer"
        data-cy="identity-twitter">
        <NeoIcon pack="fab" icon="x-twitter" class="has-text-link" />
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NeoIcon } from '@kodadot1/brick'

const address = inject('address')
const shortenedAddress = inject('shortenedAddress')

const identity = inject<{ [x: string]: string }>('identity')
const { urlPrefix } = usePrefix()
const { toast } = useToast()
</script>

<style lang="scss" scoped>
@import '@/styles/abstracts/variables';

.popover-image {
  min-width: 60px;
}

.break-word {
  overflow-wrap: break-word;
}

.popover-header {
  @include ktheme() {
    border-bottom: 1px solid theme('k-grey');
  }

  .popover-user-heading {
    font-size: 12px;

    @include ktheme() {
      color: theme('k-grey');
    }
  }
}
</style>
