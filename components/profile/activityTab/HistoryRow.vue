<template>
  <div v-if="isDesktop" class="columns mb-2">
    <div class="column is-clipped">
      <div class="is-flex is-align-items-center">
        <nuxt-link :to="`/${urlPrefix}/gallery/${event.Item.id}`" class="h-50">
          <NeoAvatar
            :avatar="avatar"
            :placeholder="placeholder"
            :name="event.Item.name"
            :size="50" />
        </nuxt-link>
        <nuxt-link
          class="is-ellipsis is-inline-block"
          :to="`/${urlPrefix}/gallery/${event.Item.id}`">
          <span class="ml-5 has-text-weight-bold is-clipped">
            {{ event.Item.name }}
          </span>
        </nuxt-link>
      </div>
    </div>

    <div class="column is-1">
      <div class="h-50 is-flex is-align-items-center">
        <EventTag
          :interaction="eventType"
          :interaction-name="interactionName" />
      </div>
    </div>

    <div class="column is-ellipsis">
      <div class="h-50 is-flex is-align-items-center">
        <div v-if="parseInt(event.Amount)">
          <CommonTokenMoney :value="event.Amount" />
        </div>
        <div v-else>{{ blank }}</div>
      </div>
    </div>

    <div class="column">
      <div class="h-50 is-flex is-align-items-center">
        <nuxt-link
          v-if="!!fromAddress"
          :to="`/${urlPrefix}/u/${fromAddress}`"
          class="has-text-link">
          <IdentityIndex ref="identity" :address="fromAddress" show-clipboard />
        </nuxt-link>
        <div v-else>
          {{ blank }}
        </div>
      </div>
    </div>

    <div v-if="withToColumn" class="column">
      <div class="h-50 is-flex is-align-items-center">
        <nuxt-link
          v-if="!!toAddress"
          :to="`/${urlPrefix}/u/${toAddress}`"
          class="has-text-link">
          <IdentityIndex ref="identity" :address="toAddress" show-clipboard />
        </nuxt-link>
        <div v-else>
          {{ blank }}
        </div>
      </div>
    </div>

    <div class="column">
      <div class="h-50 is-flex is-align-items-center">
        <NeoTooltip :label="event.Date" position="left">
          <BlockExplorerLink :block-id="event.Block" :text="event.Time" />
        </NeoTooltip>
      </div>
    </div>
  </div>
  <!-- Mobile -->
  <div v-else class="mb-6 is-flex is-flex-direction-column gap-10px">
    <div class="is-flex h-70 line-height-1">
      <nuxt-link :to="`/${urlPrefix}/gallery/${event.Item.id}`">
        <div class="mr-5">
          <NeoAvatar
            :avatar="avatar"
            :placeholder="placeholder"
            :name="event.Item.name"
            :size="70" />
        </div>
      </nuxt-link>
      <div
        class="is-flex is-flex-direction-column is-justify-content-center gap-10px is-flex-grow-1">
        <nuxt-link
          class="is-ellipsis is-inline-block mobile-fixed-width"
          :to="`/${urlPrefix}/gallery/${event.Item.id}`">
          <span class="has-text-weight-bold">
            {{ event.Item.name }}
          </span>
        </nuxt-link>

        <EventTag
          :interaction="eventType"
          :interaction-name="interactionName" />
      </div>
    </div>
    <div class="is-flex">
      <div class="is-flex is-justify-content-space-between is-flex-grow-1">
        <div v-if="parseInt(event.Amount)">
          <CommonTokenMoney :value="event.Amount" />
        </div>
        <div v-else>{{ blank }}</div>
        <NeoTooltip :label="event.Date" position="left">
          <BlockExplorerLink :block-id="event.Block" :text="event.Time" />
        </NeoTooltip>
      </div>
    </div>

    <div class="is-flex gap">
      <div v-if="!!fromAddress" class="is-flex is-align-items-center">
        <span class="is-size-7 mr-3">{{ $t('activity.event.from') }}:</span>
        <nuxt-link
          :to="`/${urlPrefix}/u/${fromAddress}`"
          class="has-text-link is-ellipsis">
          <IdentityIndex ref="identity" :address="fromAddress" show-clipboard />
        </nuxt-link>
      </div>

      <div v-if="!!toAddress" class="is-flex is-align-items-center">
        <span class="is-size-7 mr-3">{{ $t('activity.event.to') }}:</span>
        <nuxt-link
          :to="`/${urlPrefix}/u/${toAddress}`"
          class="has-text-link is-ellipsis">
          <IdentityIndex ref="identity" :address="toAddress" show-clipboard />
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NeoAvatar, NeoTooltip } from '@kodadot1/brick'
import { parseNftAvatar } from '@/utils/nft'
import { Event } from './History.vue'
import {
  blank,
  interactionNameMap,
} from '@/components/collection/activity/events/eventRow/common'
import EventTag from '@/components/collection/activity/events/eventRow/EventTag.vue'
import BlockExplorerLink from '@/components/shared/BlockExplorerLink.vue'

const props = defineProps<{
  event: Event
  withToColumn: boolean
  variant: 'Desktop' | 'Touch'
}>()

const { urlPrefix } = usePrefix()
const avatar = ref()
const { placeholder } = useTheme()

const fromAddress = computed(() => props.event.From)
const toAddress = computed(() => props.event.To)
const isDesktop = computed(() => props.variant === 'Desktop')
const eventType = computed(() => {
  if (props.event.Type === 'SELL') {
    return 'BUY'
  }
  return props.event.Type
})

const interactionName = computed(
  () => interactionNameMap[eventType.value] || eventType.value
)

const getAvatar = async () => {
  if (props.event.Item) {
    avatar.value = await parseNftAvatar(props.event.Item)
  }
}

onMounted(() => {
  getAvatar()
})
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';

.fixed-width {
  width: 66px;
}

.fixed-height {
  height: 22px;
}
.h-50 {
  height: 50px;
}

.h-70 {
  height: 70px;
}

.mobile-fixed-width {
  @include mobile {
    width: 240px;
  }
}

.line-height-1 {
  line-height: 1;
}

.gap-10px {
  gap: 10px;
}

.gap {
  gap: 1rem;
}
</style>
