export class EventCache {
  cache: WeakMap<Element, Map<string, Set<EventListener>>>;
  constructor() {
    this.cache = new WeakMap();
  }

  get(target: Element, event: string) {
    const cache = this.cache.get(target) ?? new Map();
    return cache.get(event) ?? new Set();
  }

  add(target: Element, event: string, fn: EventListener) {
    const eventCache = this.get(target, event);
    eventCache.add(fn);
    this._update(target, event, eventCache);
  }

  delete(target: Element, event: string, fn: EventListener) {
    const eventCache = this.get(target, event);
    eventCache.delete(fn);
    this._update(target, event, eventCache);
  }

  _update(target: Element, event: string, eventCache: Set<EventListener>) {
    let cache = this.cache.get(target) ?? new Map();
    cache.set(event, eventCache);
    this.cache.set(target, cache);
  }
}
