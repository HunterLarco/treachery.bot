export const EMPTY_STATE_SENTINEL: unique symbol = Symbol();

export type CachePolicy<T> = {
  onRefresh?: (newState: T, oldState: typeof EMPTY_STATE_SENTINEL | T) => void;

  shouldRefresh: (state: T) => boolean;
};

export function anyOf<T>(...policies: Array<CachePolicy<T>>): CachePolicy<T> {
  return {
    onRefresh(newState, oldState) {
      for (const policy of policies) {
        if (policy.onRefresh) {
          policy.onRefresh(newState, oldState);
        }
      }
    },

    shouldRefresh(state) {
      for (const policy of policies) {
        if (policy.shouldRefresh(state)) {
          return true;
        }
      }
      return false;
    },
  };
}

export function expiry<T>(duration: number): CachePolicy<T> {
  let lastRefreshedTime: null | Date = null;

  return {
    onRefresh(state) {
      lastRefreshedTime = new Date();
    },

    shouldRefresh(state) {
      if (lastRefreshedTime == null) {
        return true;
      }

      return Date.now() - lastRefreshedTime.getTime() > duration;
    },
  };
}

export function retryRejections<T>(): CachePolicy<Promise<T>> {
  let isErrored: boolean = false;

  return {
    onRefresh(state) {
      isErrored = false;
      state.catch(() => {
        isErrored = true;
      });
    },

    shouldRefresh(state) {
      return isErrored;
    },
  };
}
