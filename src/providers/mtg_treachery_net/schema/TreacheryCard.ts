import * as ajv from 'ajv';

import * as ajvProvider from '@/providers/ajv';
import * as singleton from '@/lib/singleton';

export type TreacheryCard = {
  id: number;
  name: string;
  uri: string;
  types: {
    supertype: string;
    subtype: string;
  };
  text: string;
  flavor: string;
  rulings: Array<string>;
};

export const TREACHERY_CARD_SCHEMA: ajv.JSONSchemaType<TreacheryCard> = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    uri: { type: 'string' },
    types: {
      type: 'object',
      properties: {
        supertype: { type: 'string' },
        subtype: { type: 'string' },
      },
      required: ['supertype', 'subtype'],
    },
    text: { type: 'string' },
    flavor: { type: 'string' },
    rulings: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['id', 'name', 'uri', 'types', 'text', 'flavor', 'rulings'],
  additionalProperties: true,
};

export const getValidator: singleton.Getter<ajv.ValidateFunction<
  TreacheryCard
>> = singleton.fromFactory(() =>
  ajvProvider.getAjvSingleton().compile(TREACHERY_CARD_SCHEMA)
);
