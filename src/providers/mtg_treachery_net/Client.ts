import fetch from 'node-fetch';

import * as treacheryCard from '@/providers/mtg_treachery_net/schema/TreacheryCard';
import * as treacheryCardSet from '@/providers/mtg_treachery_net/schema/TreacheryCardSet';

export enum TreacheryIdentityType {
  ASSASSIN = 'ASSASSIN',
  GUARDIAN = 'GUARDIAN',
  LEADER = 'LEADER',
  TRAITOR = 'TRAITOR',
}

export type TreacheryIdentities = {
  [key in TreacheryIdentityType]: Array<treacheryCard.TreacheryCard>;
};

export class Client {
  async getIdentities(): Promise<TreacheryIdentities> {
    const { cards } = await fetch(
      'https://mtgtreachery.net/rules/oracle/treachery-cards.json'
    ).then(
      async (response): Promise<treacheryCardSet.TreacheryCardSet> => {
        const json = await response.json();
        const validator = treacheryCardSet.getValidator();
        if (validator(json)) {
          return json;
        }

        throw new Error(
          'Failed to validate mtgtreachery.net set with errors: ' +
            validator.errors?.map((error) => error.message)
        );
      }
    );

    const identities: TreacheryIdentities = {
      [TreacheryIdentityType.ASSASSIN]: [],
      [TreacheryIdentityType.GUARDIAN]: [],
      [TreacheryIdentityType.LEADER]: [],
      [TreacheryIdentityType.TRAITOR]: [],
    };

    for (const card of cards) {
      switch (card.types.subtype) {
        case 'Assassin':
          identities[TreacheryIdentityType.ASSASSIN].push(card);
          break;
        case 'Guardian':
          identities[TreacheryIdentityType.GUARDIAN].push(card);
          break;
        case 'Leader':
          identities[TreacheryIdentityType.LEADER].push(card);
          break;
        case 'Traitor':
          identities[TreacheryIdentityType.TRAITOR].push(card);
          break;
        default:
          console.warn(
            `Encountered Treachery card with unknown type ${card.types.subtype}`
          );
      }
    }

    return identities;
  }
}
