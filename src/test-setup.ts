// Node 25+ provides a built-in localStorage that lacks .clear() and conflicts
// with test environments. Override globalThis.localStorage with a simple
// in-memory implementation that supports the full Web Storage API.

const store = new Map<string, string>()

const storage: Storage = {
  getItem(key: string) {
    return store.get(key) ?? null
  },
  setItem(key: string, value: string) {
    store.set(key, String(value))
  },
  removeItem(key: string) {
    store.delete(key)
  },
  clear() {
    store.clear()
  },
  key(index: number) {
    return [...store.keys()][index] ?? null
  },
  get length() {
    return store.size
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  writable: true,
  configurable: true,
})
