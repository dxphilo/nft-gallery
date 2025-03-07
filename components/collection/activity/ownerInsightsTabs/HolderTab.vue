<template>
  <div>
    <div v-if="displayedHolders.length">
      <div
        v-for="[holderId, holdings] in displayedHolders"
        :key="holderId"
        class="">
        <div class="is-flex is-flex-direction-column gap">
          <div class="px-5">
            <ProfileLink
              :address="holderId"
              :avatar-size="35"
              class="has-text-weight-bold" />
            <div class="is-flex is-justify-content-space-between mt-2">
              <span class="is-size-7 has-text-grey">{{
                $t('activity.owned')
              }}</span>
              <span>{{ holdings.nftCount }}</span>
            </div>
            <div class="is-flex is-justify-content-space-between">
              <span class="is-size-7 has-text-grey">{{
                $t('activity.totalBought')
              }}</span>
              <CommonTokenMoney :value="holdings.totalBought" />
            </div>
            <div class="is-flex is-justify-content-space-between">
              <span class="is-size-7 has-text-grey">{{
                $t('activity.totalSold')
              }}</span>
              <CommonTokenMoney
                v-if="holdings.totalSold > 0"
                :value="holdings.totalSold" />
              <span v-else>--</span>
            </div>
            <div class="is-flex is-justify-content-space-between">
              <span class="is-size-7 has-text-grey">{{
                $t('activity.date')
              }}</span>
              <span>{{ timeAgo(holdings.lastActivityTimestamp) }}</span>
            </div>
            <div>
              <div
                class="is-size-7 has-text-k-blue is-clickable"
                @click="toggleNFTDetails(holderId)">
                {{ $t('activity.nftDetails') }}
                <NeoIcon
                  :icon="
                    isNFTDetailsOpen[holderId]
                      ? 'chevron-down'
                      : 'chevron-right'
                  " />
              </div>
            </div>
          </div>

          <div v-if="isNFTDetailsOpen[holderId]">
            <NFTsDetaislDropdown
              :holder-nfts="holdings.nfts"
              variant="Holders" />
          </div>
        </div>
        <hr class="my-3 mx-5" />
      </div>
      <div ref="target" />
    </div>
    <div
      v-else
      class="is-flex is-justify-content-center is-align-items-center pt-6 px-6">
      <div class="has-text-grey has-text-centered">
        {{ $t('activity.noHolders') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfileLink from '@/components/profile/ProfileLink.vue'
import { Owners } from '@/composables/collectionActivity/types'
import { NeoIcon } from '@kodadot1/brick'

import NFTsDetaislDropdown from './NFTsDetaislDropdown.vue'
import { timeAgo } from '@/components/collection/utils/timeAgo'

const toggleNFTDetails = (holderId: string) => {
  const isOpen = isNFTDetailsOpen.value[holderId]
  isNFTDetailsOpen.value = {
    ...isNFTDetailsOpen.value,
    [holderId]: !isOpen,
  }
}
const target = ref<HTMLElement | null>(null)
const offset = ref(4)

const holders = computed(() =>
  Object.entries(props.owners || {}).sort(
    // sort by nft count: highest first
    (a, b) => b[1].nftCount - a[1].nftCount
  )
)

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    offset.value += 4
  }
})

const displayedHolders = computed(() => holders.value.slice(0, offset.value))

// map of owner id to bolean, is the NFT details section of that owner open or nor
// {id0: false, id1: true, id3: false, ...}
const isNFTDetailsOpen = ref(
  holders.value.reduce(
    (isOpen, [holderId, _]) => ({
      ...isOpen,
      [holderId]: false,
    }),
    {}
  )
)

const props = defineProps<{
  owners?: Owners
}>()
</script>

<style lang="scss" scoped>
.gap {
  gap: 0.5rem;
}
.hide-last-hr:last-child > hr {
  display: none;
}
</style>
