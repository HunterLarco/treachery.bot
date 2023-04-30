export type Factory<T> = () => T;

export type CacheState<T> = {
  value: T;
  computedAt: Date;
};

export type CachePolicy<T> = {
  onRefresh?: (newState: CacheState<T>, oldState: null | CacheState<T>) => void;

  shouldRefresh: (state: CacheState<T>) => boolean;
};

export class CachedPromise<T> {
  #factory: Factory<T>;
  #policy: CachePolicy<T>;
  #state: null | CacheState<T>;

  constructor(factory: Factory<T>, policy: CachePolicy<T>) {
    this.#factory = factory;
    this.#policy = policy;
    this.#state = null;
  }

  get value(): T {
    if (this.#state == null || this.#policy.shouldRefresh(this.#state)) {
      return this.refresh();
    }

    return this.#state.value;
  }

  refresh(): T {
    const oldState = this.#state;

    this.#state = {
      value: this.#factory(),
      computedAt: new Date(),
    };

    if (this.#policy.onRefresh) {
      this.#policy.onRefresh(this.#state, oldState);
    }

    return this.#state.value;
  }

  evict(): void {
    this.#state = null;
  }
}
