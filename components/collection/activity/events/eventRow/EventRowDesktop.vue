<template>
  <div class="columns mb-2">
    <div class="column is-clipped">
      <div class="is-flex is-align-items-center">
        <nuxt-link
          :to="`/${urlPrefix}/gallery/${event.nft.id}`"
          class="height-50px">
          <NeoAvatar
            :avatar="avatar"
            :placeholder="placeholder"
            :name="event.nft.name"
            :size="50" />
        </nuxt-link>
        <nuxt-link
          class="is-ellipsis is-inline-block"
          :to="`/${urlPrefix}/gallery/${event.nft.id}`">
          <span class="ml-5 has-text-weight-bold is-clipped">
            {{ event.nft.name }}
          </span>
        </nuxt-link>
      </div>
    </div>

    <div class="column is-1">
      <div class="height-50px is-flex is-align-items-center">
        <EventTag
          :interaction="event.interaction"
          :interaction-name="interactionName" />
      </div>
    </div>

    <div class="column is-ellipsis">
      <div class="height-50px is-flex is-align-items-center">
        <div v-if="amount === blank">
          {{ blank }}
        </div>
        <CommonTokenMoney v-else :value="amount" />
      </div>
    </div>

    <div class="column">
      <div class="height-50px is-flex is-align-items-center">
        <nuxt-link
          v-if="fromAddress !== blank"
          :to="`/${urlPrefix}/u/${fromAddress}`"
          class="has-text-link">
          <IdentityIndex ref="identity" :address="fromAddress" show-clipboard />
        </nuxt-link>
        <div v-else>
          {{ blank }}
        </div>
      </div>
    </div>
    <div class="column">
      <div class="height-50px is-flex is-align-items-center">
        <nuxt-link
          v-if="toAddress !== blank"
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
      <div class="height-50px is-flex is-align-items-center">
        {{ timeAgo(event.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  InteractionWithNFT,
  Offer,
} from '@/composables/collectionActivity/types'
import IdentityIndex from '@/components/identity/IdentityIndex.vue'
import { timeAgo } from '@/components/collection/utils/timeAgo'
import {
  blank,
  getAmount,
  getFromAddress,
  getNFTAvatar,
  getToAddress,
  interactionNameMap,
} from './common'
import EventTag from './EventTag.vue'
import { NeoAvatar } from '@kodadot1/brick'

const { urlPrefix } = usePrefix()
const props = defineProps<{
  event: InteractionWithNFT | Offer
}>()

const avatar = ref<string>()
const { placeholder } = useTheme()

const interactionName = computed(
  () => interactionNameMap[props.event.interaction] || props.event.interaction
)
const amount = computed(() => getAmount(props.event))

const fromAddress = computed(() => getFromAddress(props.event))

const toAddress = computed(() => getToAddress(props.event))

onMounted(() => {
  getAvatar()
})

const getAvatar = async () => {
  if (props.event) {
    avatar.value = await getNFTAvatar(props.event)
  }
}
</script>

<style scoped lang="scss">
.fixed-width {
  width: 66px;
}

.fixed-height {
  height: 22px;
}
.height-50px {
  height: 50px;
}
</style>
