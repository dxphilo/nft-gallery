import resolveQueryPath from '@/utils/queryPathResolver'
import { notificationTypes, showNotification } from '@/utils/notification'
import type { QueryOptions } from 'apollo-client'
import { ComputedRef } from 'vue/types'

export const useQueryParams = ({
  queryPrefix,
  clientName = '',
}: {
  queryPrefix: string
  clientName: string | ComputedRef<string>
}) => {
  const { client } = usePrefix()

  return {
    prefix: queryPrefix || client.value,
    client: clientName || client.value,
  }
}

export default function ({
  queryPrefix = '',
  queryName,
  clientName,
  variables = {},
  options = {},
  disabled = computed(() => false),
  data = ref(),
  error = ref(),
  loading = ref(true),
}) {
  const { $apollo, $consola } = useNuxtApp()
  const { prefix, client } = useQueryParams({ queryPrefix, clientName })

  interface DoFetchParams {
    options?: Omit<QueryOptions, 'query'>
    variables?: Record<string, unknown>
  }
  async function doFetch({
    options: extraOptions = {},
    variables: extraVariables = {},
  }: DoFetchParams = {}) {
    const query = await resolveQueryPath(prefix, queryName)

    try {
      const response = await $apollo.query({
        query: query.default,
        client: isRef(client) ? client.value : client,
        variables: { ...variables, ...extraVariables },
        ...options,
        ...extraOptions,
      })
      data.value = response.data
    } catch (err) {
      ;(error.value as unknown) = err
      showNotification(`${err as string}`, notificationTypes.danger)
      $consola.error(err)
    } finally {
      loading.value = false
    }
  }

  async function refetch(variables: Record<string, unknown> = {}) {
    await doFetch({
      options: {
        fetchPolicy: 'network-only',
      },
      variables,
    })
  }

  if (!disabled.value) {
    if (isRef(variables)) {
      watchEffect(() => doFetch())
    } else {
      doFetch()
    }
  }

  return {
    data,
    error,
    refetch,
    loading,
  }
}
