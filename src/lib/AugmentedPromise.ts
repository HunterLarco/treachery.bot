export enum PromiseState {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
}

export class AugmentedPromise<T> {
  #promise: Promise<T>;
  #state: PromiseState;

  constructor(promise: Promise<T>) {
    this.#promise = promise;

    this.#state = PromiseState.PENDING;
    this.#promise
      .then(() => {
        this.#state = PromiseState.FULFILLED;
      })
      .catch(() => {
        this.#state = PromiseState.REJECTED;
      });
  }

  get state(): PromiseState {
    return this.#state;
  }

  get promise(): Promise<T> {
    return this.#promise;
  }
}
