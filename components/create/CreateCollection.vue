<template>
  <div class="is-centered" :class="{ columns: classColumn }">
    <Loader v-model="isLoading" :status="status" />
    <form
      class="is-half"
      :class="{ column: classColumn }"
      @submit.prevent="createCollection">
      <h1 class="title is-size-3">
        {{ $t('mint.collection.create') }}
      </h1>

      <!-- collection logo -->
      <NeoField :label="`${$t('mint.collection.logo.image')} *`">
        <div>
          <p>{{ $t('mint.collection.logo.message') }}</p>
          <DropUpload
            v-model="logo"
            required
            expanded
            preview
            :label="$t('mint.collection.drop')" />
        </div>
      </NeoField>

      <!-- collection name -->
      <NeoField
        :label="`${$t('mint.collection.name.label')} *`"
        required
        :error="!name">
        <NeoInput v-model="name" required />
      </NeoField>

      <!-- collection description -->
      <NeoField
        :label="`${$t('mint.collection.description.label')} (optional)`">
        <NeoInput
          v-model="description"
          type="textarea"
          has-counter
          maxlength="1000"
          height="10rem" />
      </NeoField>

      <!-- collection max nfts -->
      <NeoField
        v-if="!isBasilisk"
        :label="$t('Maximum NFTs in collection')"
        required>
        <div class="w-full">
          <div class="is-flex is-justify-content-space-between">
            <p>{{ $t('mint.unlimited') }}</p>
            <NeoSwitch v-model="unlimited" />
          </div>
          <NeoInput
            v-if="!unlimited"
            v-model="max"
            class="mt-3"
            type="number"
            placeholder="1 is the minimum"
            :min="1" />
        </div>
      </NeoField>

      <!-- select blockchain -->
      <NeoField :label="`${$t('mint.blockchain.label')} *`">
        <div>
          <p>{{ $t('mint.blockchain.message') }}</p>
          <NeoSelect v-model="selectBlockchain" class="mt-3" expanded>
            <option v-for="menu in menus" :key="menu.value" :value="menu.value">
              {{ menu.text }}
            </option>
          </NeoSelect>
        </div>
      </NeoField>

      <!-- collection symbol -->
      <NeoField
        v-if="isRemark"
        :label="`${$t('mint.collection.symbol.label')} *`">
        <div>
          <p>{{ $t('mint.collection.symbol.message') }}</p>
          <NeoInput
            ref="symbolInput"
            v-model="symbol"
            :placeholder="$t('mint.collection.symbol.placeholder')"
            minlength="3"
            required
            expanded />
        </div>
      </NeoField>

      <!-- deposit -->
      <div>
        <hr class="my-6" />
        <NeoField>
          <div class="monospace">
            <p class="has-text-weight-medium is-size-6 has-text-info">
              <span>{{ $t('mint.deposit') }}:</span>
              <span>{{ totalCollectionDeposit }} {{ chainSymbol }}</span>
            </p>
            <p>
              <span>{{ $t('general.balance') }}: </span>
              <span>{{ balance }} {{ chainSymbol }}</span>
            </p>
            <nuxt-link v-if="isBasilisk" :to="`/${currentChain}/assets`">
              {{ $t('general.tx.feesPaidIn', [chainSymbol]) }}
            </nuxt-link>
          </div>
        </NeoField>
      </div>

      <hr class="my-6" />

      <!-- create collection button -->
      <NeoField>
        <div>
          <NeoButton
            expanded
            :label="`${canDeposit ? 'Create Collection' : 'Not Enough Funds'}`"
            type="submit"
            size="medium"
            :loading="isLoading"
            :disabled="!canDeposit" />

          <div class="p-4 is-flex">
            <NeoIcon icon="circle-info" size="medium" class="mr-4" />
            <p class="is-size-7">
              <span
                v-safe-html="
                  $t('mint.requiredDeposit', [
                    `${totalCollectionDeposit} ${chainSymbol}`,
                  ])
                " />
              <a
                href="https://hello.kodadot.xyz/multi-chain/fees"
                target="_blank"
                class="has-text-link"
                rel="nofollow noopener noreferrer">
                {{ $t('helper.learnMore') }}
              </a>
            </p>
          </div>
        </div>
      </NeoField>
    </form>
  </div>
</template>

<script setup lang="ts">
import type {
  BaseCollectionType,
  CollectionToMintBasilisk,
  CollectionToMintKusama,
  CollectionToMintStatmine,
} from '@/composables/transaction/types'
import type { Prefix } from '@kodadot1/static'

import {
  NeoButton,
  NeoField,
  NeoIcon,
  NeoInput,
  NeoSelect,
  NeoSwitch,
} from '@kodadot1/brick'
import DropUpload from '@/components/shared/DropUpload.vue'
import { availablePrefixes } from '@/utils/chain'
import { Interaction } from '@kodadot1/minimark/v1'
import { notificationTypes, showNotification } from '@/utils/notification'
import { makeSymbol } from '@kodadot1/minimark/shared'

// props
withDefaults(
  defineProps<{
    classColumn?: boolean
  }>(),
  {
    classColumn: true,
  }
)

// composables
const { transaction, status, isLoading } = useTransaction()
const { urlPrefix, setUrlPrefix } = usePrefix()
const { $consola } = useNuxtApp()

// form state
const logo = ref<File | null>(null)
const name = ref('')
const description = ref('')
const unlimited = ref(true)
const max = ref(1)
const symbol = ref('')

const menus = availablePrefixes().filter(
  (menu) => menu.value !== 'movr' && menu.value !== 'glmr'
)
const chainByPrefix = menus.find((menu) => menu.value === urlPrefix.value)
const selectBlockchain = ref(chainByPrefix?.value || menus[0].value)

const currentChain = computed(() => {
  return selectBlockchain.value as Prefix
})

const { isAssetHub, isBasilisk, isRemark } = useIsChain(currentChain)
const { balance, totalCollectionDeposit, chainSymbol } =
  useDeposit(currentChain)

// balance state
const canDeposit = computed(() => {
  return parseFloat(balance.value) >= parseFloat(totalCollectionDeposit.value)
})

watchEffect(() => setUrlPrefix(currentChain.value as Prefix))

const createCollection = async () => {
  let collection: BaseCollectionType = {
    file: logo.value,
    name: name.value,
    description: description.value,
  }

  if (isAssetHub.value) {
    collection['nftCount'] = unlimited.value ? 0 : max.value
  }

  if (isBasilisk.value) {
    collection['tags'] = []
  }

  if (isRemark.value) {
    collection['symbol'] = symbol.value
    collection['nftCount'] = unlimited.value ? 0 : max.value
  }

  if (totalCollectionDeposit.value && canDeposit.value === false) {
    return
  }

  try {
    showNotification(
      `Creating Collection: "${name.value}"`,
      notificationTypes.info
    )
    isLoading.value = true

    await transaction(
      {
        interaction: Interaction.MINT,
        urlPrefix: currentChain.value,
        collection: collection as
          | CollectionToMintBasilisk
          | CollectionToMintKusama
          | CollectionToMintStatmine,
      },
      currentChain.value
    )
  } catch (error) {
    showNotification(`[ERR] ${error}`, notificationTypes.warn)
    $consola.error(error)
  }
}

onMounted(() => {
  symbol.value = makeSymbol()
})
</script>

<style lang="scss" scoped>
@import '@/styles/abstracts/variables';

.o-field:not(:last-child) {
  margin-bottom: 2rem;
}

.column {
  max-width: 36rem;
  padding: 4rem;

  @include desktop() {
    @include ktheme() {
      background-color: theme('background-color');
      box-shadow: theme('primary-shadow');
    }
  }

  @include touch() {
    padding: 0 1rem;
    box-shadow: none !important;
  }
}

@include desktop() {
  .columns {
    padding: 5.25rem 0;

    @include ktheme() {
      background-color: theme('k-primaryLight');
    }
  }
}
</style>
