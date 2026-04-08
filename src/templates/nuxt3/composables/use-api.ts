export function useApi<T>(path: string, options?: Parameters<typeof useFetch<T>>[1]) {
  const config = useRuntimeConfig();

  return useFetch<T>(path, {
    baseURL: config.public.apiBase,
    ...options,
  });
}
