import * as ajv from 'ajv';

import * as ajvProvider from '@/providers/ajv';
import * as singleton from '@/lib/singleton';

import * as treacheryCard from '@/providers/mtg_treachery_net/schema/TreacheryCard';

export type TreacheryCardSet = {
  cards: Array<treacheryCard.TreacheryCard>;
};

export const TREACHERY_CARD_SET_SCHEMA: ajv.JSONSchemaType<TreacheryCardSet> = {
  type: 'object',
  properties: {
    cards: {
      type: 'array',
      items: treacheryCard.TREACHERY_CARD_SCHEMA,
    },
  },
  required: ['cards'],
};

export const getValidator: singleton.Getter<ajv.ValidateFunction<
  TreacheryCardSet
>> = singleton.fromFactory(() =>
  ajvProvider.getAjvSingleton().compile(TREACHERY_CARD_SET_SCHEMA)
);
