import * as cachedPromise from '@/lib/CachedPromise';

export function anyOf<T>(
  policies: Array<cachedPromise.CachePolicy<T>>
): cachedPromise.CachePolicy<T> {
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

export function expiry<T>(duration: number): cachedPromise.CachePolicy<T> {
  return {
    shouldRefresh(state) {
      return Date.now() - state.computedAt.getTime() > duration;
    },
  };
}

export function retryRejections<T>(): cachedPromise.CachePolicy<Promise<T>> {
  let isErrored: boolean = false;

  return {
    onRefresh(state) {
      isErrored = false;
      state.value.catch(() => {
        isErrored = true;
      });
    },

    shouldRefresh(state) {
      return isErrored;
    },
  };
}
