import * as mtgTreacheryProvider from '@/providers/mtg_treachery_net';
import * as cache from '@/lib/cache';
import * as cachePolicy from '@/lib/cache/policy';

export type ServerContext = {
  data: {
    treacheryCards: cache.CachedGetter<
      Promise<mtgTreacheryProvider.TreacheryIdentities>
    >;
  };
};

export function createServerContext(): ServerContext {
  const mtgTreacheryClient = mtgTreacheryProvider.createClient();

  return {
    data: {
      treacheryCards: new cache.CachedGetter(
        mtgTreacheryClient.getIdentities,
        cachePolicy.anyOf(
          cachePolicy.expiry(24 * 60 * 60 * 1000 /* 24 hours */),
          cachePolicy.retryRejections()
        )
      ),
    },
  };
}
