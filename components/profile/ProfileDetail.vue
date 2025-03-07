<template>
  <div>
    <NeoModal v-model="isModalActive" @close="isModalActive = false">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">{{ $t('sharing.profile') }}</p>
        </header>
        <div class="card-content has-text-centered">
          <QRCode :text="realworldFullPath" color="#db2980" bg-color="#000" />
        </div>
      </div>
    </NeoModal>
    <div class="container is-fluid py-7 border-bottom">
      <div class="columns is-centered">
        <div class="column is-half has-text-centered">
          <div class="container image is-64x64 mb-2">
            <Avatar :value="id" />
          </div>
          <h1 class="title is-2" data-cy="user-identity">
            <a
              v-if="hasBlockExplorer"
              v-safe-href="explorer"
              target="_blank"
              rel="nofollow noopener noreferrer">
              <Identity
                ref="identity"
                hide-identity-popover
                :address="id"
                emit
                @change="handleIdentity" />
            </a>
            <Identity
              v-else
              ref="identity"
              :address="id"
              emit
              @change="handleIdentity" />
          </h1>

          <NeoButton
            v-if="isAllowSetIdentity"
            to="/identity"
            no-shadow
            class="mb-4"
            rounded
            tag="nuxt-link"
            size="small">
            + {{ $t('identity.set') }}
          </NeoButton>

          <div
            class="is-flex is-align-items-center is-justify-content-center is-flex-wrap-wrap">
            <NeoButton
              v-safe-href="`https://subscan.io/account/${id}`"
              no-shadow
              variant="text"
              label="Subscan"
              tag="a"
              target="_blank"
              rel="nofollow noopener noreferrer" />

            <div class="divider" />
            <NeoButton
              v-safe-href="`https://sub.id/#/${id}`"
              no-shadow
              variant="text"
              label="SubID"
              tag="a"
              target="_blank"
              rel="nofollow noopener noreferrer" />

            <div class="divider" />
            <NeoButton
              v-clipboard:copy="id"
              variant="text"
              :label="$t('share.copyAddress')"
              no-shadow
              @click.native="toast(`${$i18n.t('general.copyToClipboard')}`)" />
            <div class="divider" />
            <NeoButton
              variant="text"
              no-shadow
              :label="$t('share.qrCode')"
              @click.native="isModalActive = true" />
            <div class="divider" />
            <NeoButton
              no-shadow
              :label="$t('transfer')"
              variant="text"
              tag="nuxt-link"
              :to="`/${urlPrefix}/transfer?target=${id}&usdamount=10&donation=true`">
            </NeoButton>
          </div>
        </div>
      </div>
      <div class="columns is-centered is-align-items-center">
        <div
          class="column is-12-mobile is-6-tablet is-7-desktop is-8-widescreen">
          <ProfileActivity :id="id" />
        </div>
      </div>
      <div class="is-flex is-hidden-touch is-hidden-desktop-only">
        <TabItem
          v-for="tab in tabs"
          :key="tab"
          class="is-capitalized"
          :active="activeTab === tab"
          :text="tab"
          @click.native="() => switchToTab(tab)" />
        <ChainDropdown class="ml-6" />
        <OrderByDropdown v-if="activeTab !== 'activity'" class="ml-6" />
      </div>
      <div class="is-flex is-flex-direction-row is-hidden-widescreen mobile">
        <TabItem
          v-for="tab in tabs"
          :key="tab"
          :active="activeTab === tab"
          :text="tab"
          class="is-capitalized"
          @click.native="() => switchToTab(tab)" />
        <div class="is-flex mt-4">
          <ChainDropdown />
          <OrderByDropdown v-if="activeTab !== 'activity'" class="ml-4" />
        </div>
      </div>
    </div>

    <div class="container is-fluid pb-6">
      <div
        v-if="activeTab === 'owned' || activeTab === 'created'"
        class="is-flex-grow-1">
        <div
          class="is-flex is-justify-content-space-between pb-4 pt-5 is-align-content-center">
          <div class="is-flex">
            <FilterButton :label="$t('sort.listed')" url-param="buy_now" />
            <FilterButton
              v-if="activeTab === 'created'"
              :label="$t('activity.sold')"
              url-param="sold"
              class="ml-4" />
          </div>
          <div class="is-hidden-mobile">
            <ProfileGrid class="is-hidden-mobile" />
          </div>
        </div>
        <hr class="my-0" />
        <ItemsGrid :search="itemsGridSearch" />
      </div>
      <CollectionGrid
        v-if="activeTab === 'collections'"
        :id="id"
        class="pt-7" />
      <Activity v-if="activeTab === 'activity'" :id="id" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getExplorer, hasExplorer } from '@kodadot1/static'
import { NeoButton, NeoModal } from '@kodadot1/brick'
import TabItem from '@/components/shared/TabItem.vue'
import Identity from '@/components/identity/IdentityIndex.vue'
import ItemsGrid from '@/components/items/ItemsGrid/ItemsGrid.vue'
import ProfileGrid from './ProfileGrid.vue'
import ProfileActivity from './ProfileActivitySummery.vue'
import FilterButton from './FilterButton.vue'
import ChainDropdown from '@/components/common/ChainDropdown.vue'
import OrderByDropdown from './OrderByDropdown.vue'
import CollectionGrid from '@/components/collection/CollectionGrid.vue'
import Activity from './activityTab/Activity.vue'

const route = useRoute()
const { toast } = useToast()
const { replaceUrl } = useReplaceUrl()
const { accountId } = useAuth()
const { urlPrefix } = usePrefix()
const tabs = ['owned', 'created', 'collections', 'activity']

const switchToTab = (tab: string) => {
  activeTab.value = tab
}

const id = computed(() => route.params.id || '')
const email = ref('')
const twitter = ref('')
const displayName = ref('')
const web = ref('')
const legal = ref('')
const riot = ref('')
const isModalActive = ref(false)

const itemsGridSearch = computed(() => {
  const tabKey = activeTab.value === 'owned' ? 'currentOwner_eq' : 'issuer_eq'
  const query: Record<string, unknown> = {
    [tabKey]: id.value,
  }

  if (listed.value) {
    query['price_gt'] = 0
  }
  if (sold.value) {
    query['events_some'] = {
      interaction_eq: 'BUY',
      AND: { caller_not_eq: id.value },
    }
  }

  return query
})

const realworldFullPath = computed(() => window.location.href)

const activeTab = computed({
  get: () => (route.query.tab as string) || 'owned',
  set: (val) => {
    replaceUrl({ tab: val })
  },
})

const listed = computed(() => route.query.buy_now === 'true')

const sold = computed(() => route.query.sold === 'true')

const isMyProfile = computed(() => id.value === accountId.value)
const hasBlockExplorer = computed(() => hasExplorer(urlPrefix.value))
const explorer = computed(() => getExplorer(urlPrefix.value, id.value))

const isAllowSetIdentity = computed(() => {
  return !displayName.value && isMyProfile.value && hasBlockExplorer.value
})

const handleIdentity = (identityFields: Record<string, string>) => {
  displayName.value = identityFields?.display
  email.value = identityFields?.email
  twitter.value = identityFields?.twitter
  riot.value = identityFields?.riot
  web.value = identityFields?.web
  legal.value = identityFields?.legal
}
</script>

<style lang="scss" scoped>
@import '@/styles/abstracts/variables';

.invisible-tab > nav.tabs {
  display: none;
}

:deep .control {
  width: 12rem;
}
:deep .explore-tabs-button {
  width: 12rem;
}

@include until-widescreen {
  .mobile {
    flex-wrap: wrap;
    > * {
      flex: 1 0 50%;
    }
    :deep .explore-tabs-button {
      width: 100% !important;
    }
  }
}

.tab-counter::before {
  content: ' - ';
  white-space: pre;
}

.title {
  flex-grow: 0;
  flex-basis: auto;
}

.divider {
  width: 1px;
  height: 5px;
  background-color: grey;
  margin: 0 10px;
}
</style>
