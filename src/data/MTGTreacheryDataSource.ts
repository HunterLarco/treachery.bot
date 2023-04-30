import fetch from 'node-fetch';

import * as cache from '@/lib/cache';
import * as cachePolicy from '@/lib/cache/policy';

const kDuration_Day = 24 * 60 * 60 * 1000;

async function fetchIdentities() {
  const { cards } = await fetch(
    'https://mtgtreachery.net/rules/oracle/treachery-cards.json'
  ).then((response) => response.json() as Promise<{ cards: Array<any> }>);

  for (const card of cards) {
    card.image = encodeURI(
      `https://mtgtreachery.net/images/cards/en/trd/${card.types.subtype} - ${card.name}.jpg`
    );
  }

  return {
    assassins: cards.filter((card) => card.types.subtype == 'Assassin'),
    guardians: cards.filter((card) => card.types.subtype == 'Guardian'),
    leaders: cards.filter((card) => card.types.subtype == 'Leader'),
    traitors: cards.filter((card) => card.types.subtype == 'Traitor'),
  };
}

export const IdentityDataSource = new cache.CachedGetter(
  () => fetchIdentities(),
  cachePolicy.anyOf(
    cachePolicy.expiry(kDuration_Day),
    cachePolicy.retryRejections()
  )
);
