import * as mtgTreacheryClient from '@/providers/mtg_treachery_net/Client';
import * as treacheryCard from '@/providers/mtg_treachery_net/schema/TreacheryCard';

export type Client = mtgTreacheryClient.Client;
export type TreacheryIdentityType = mtgTreacheryClient.TreacheryIdentityType;
export type TreacheryIdentities = mtgTreacheryClient.TreacheryIdentities;
export type TreacheryCard = treacheryCard.TreacheryCard;

export function createClient() {
  return new mtgTreacheryClient.Client();
}
