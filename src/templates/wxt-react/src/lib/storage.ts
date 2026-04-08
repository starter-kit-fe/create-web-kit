export async function setStoredValue<T>(key: string, value: T) {
  await browser.storage.local.set({ [key]: value });
}

export async function getStoredValue<T>(key: string): Promise<T | undefined> {
  const result = await browser.storage.local.get(key);
  return result[key] as T | undefined;
}
