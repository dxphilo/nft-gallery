<template>
  <div>
    <h1 class="title is-size-3">
      Claiming does not work yet another mail will come
    </h1>
    <NeoField>
      <Auth />
    </NeoField>
    <template v-if="isLogIn">
      <BasicInput
        v-model="token"
        :label="$t('mint.collection.name.label')"
        :message="$t('mint.collection.name.message')"
        :placeholder="$t('mint.collection.name.placeholder')"
        :disabled="hasToken"
        expanded
        required />
      <!-- <SubmitButton
        icon="plus"
        label="claim"
        :loading="isLoading"
        expanded
        @click="submit" /> -->
    </template>
  </div>
</template>

<script setup lang="ts">
import { getWaifuById } from '@/services/supabase'
import { claimWaifu } from '@/services/waifu'
import { notificationTypes, showNotification } from '@/utils/notification'
import { NeoField } from '@kodadot1/brick'

const Auth = defineAsyncComponent(() => import('@/components/shared/Auth.vue'))

const BasicInput = defineAsyncComponent(
  () => import('@/components/shared/form/BasicInput.vue')
)

// const SubmitButton = defineAsyncComponent(
//   () => import('@/components/base/SubmitButton.vue')
// )

const token = ref('')
const hasToken = ref(false)
const { query } = useRoute()
const waifu = ref<any>(null)
const { accountId, isLogIn } = useAuth()

const fetchWaifu = async (id: string) => {
  const waifuResponse = await getWaifuById(id)
  if (waifuResponse) {
    waifu.value = waifuResponse
  }
}

if (query.token) {
  token.value = query.token as string
  hasToken.value = true
  // fetchWaifu(token.value).catch((e) => {
  //   console.error(e)
  // })
}

const isLoading = ref(false)
const submit = async () => {
  try {
    showNotification('Claiming your POAP', notificationTypes.info)
    isLoading.value = true
    await claimWaifu(token.value, accountId.value)
    showNotification('POAP was claimed', notificationTypes.success)
    isLoading.value = false
  } catch (error) {
    console.error(error)
    showNotification('Error claiming your POAP', notificationTypes.warn)
    isLoading.value = false
  }
}
</script>
