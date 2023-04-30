import * as augmentedPromise from '@/lib/AugmentedPromise';
import * as cachedPromise from '@/lib/CachedPromise';

export function anyOf<T>(
  policies: Array<cachedPromise.CachePolicy<T>>
): cachedPromise.CachePolicy<T> {
  return {
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

export function retryRejections<T>(): cachedPromise.CachePolicy<
  augmentedPromise.AugmentedPromise<T>
> {
  return {
    shouldRefresh(state) {
      return state.value.state === augmentedPromise.PromiseState.REJECTED;
    },
  };
}
