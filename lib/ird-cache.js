class IRDCache {
  constructor() {
    this.store = new Map();
    this.ttl = 30 * 60 * 1000; // 30 minutos
  }

  set(key, data) {
    this.store.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    // Verificar expiración
    if (Date.now() - item.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

export const irdCache = new IRDCache();
