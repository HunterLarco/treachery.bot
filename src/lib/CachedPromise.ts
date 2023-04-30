export type Factory<T> = () => T;

export type CacheState<T> = {
  value: T;
  computedAt: Date;
};

export type CachePolicy<T> = {
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
    this.#state = {
      value: this.#factory(),
      computedAt: new Date(),
    };

    return this.#state.value;
  }

  evict(): void {
    this.#state = null;
  }
}
