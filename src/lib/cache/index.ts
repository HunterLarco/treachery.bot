import * as cachePolicy from '@/lib/cache/policy';

export type Factory<T> = () => T;

export class CachedGetter<T> {
  #factory: Factory<T>;
  #policy: cachePolicy.CachePolicy<T>;
  #cachedValue: typeof cachePolicy.EMPTY_STATE_SENTINEL | T;

  constructor(factory: Factory<T>, policy: cachePolicy.CachePolicy<T>) {
    this.#factory = factory;
    this.#policy = policy;
    this.#cachedValue = cachePolicy.EMPTY_STATE_SENTINEL;
  }

  get value(): T {
    if (
      this.#cachedValue === cachePolicy.EMPTY_STATE_SENTINEL ||
      this.#policy.shouldRefresh(this.#cachedValue)
    ) {
      return this.refresh();
    }

    return this.#cachedValue;
  }

  refresh(): T {
    const oldState = this.#cachedValue;
    this.#cachedValue = this.#factory();

    if (this.#policy.onRefresh) {
      this.#policy.onRefresh(this.#cachedValue, oldState);
    }

    return this.#cachedValue;
  }

  evict(): void {
    this.#cachedValue = cachePolicy.EMPTY_STATE_SENTINEL;
  }
}
