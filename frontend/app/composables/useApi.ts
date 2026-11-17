type ApiResponse<T> = {
  data: T
}

export function useApi() {
  const config = useRuntimeConfig()

  async function apiFetch<T>(
    path: string,
    options: Parameters<typeof $fetch<T>>[1] = {}
  ) {
    return await $fetch<ApiResponse<T>>(
      `${config.public.apiBase}${path}`,
      options
    )
  }

  async function apiFetchRaw<T>(
    path: string,
    options: Parameters<typeof $fetch<T>>[1] = {}
  ) {
    return await $fetch<T>(
      `${config.public.apiBase}${path}`,
      options
    )
  }

  return {
    apiFetch,
    apiFetchRaw
  }
}