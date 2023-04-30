import pickRandom from 'pick-random';
import shuffleArray from 'shuffle-array';

import { IdentityDataSource } from '@/data/MTGTreacheryDataSource';

export enum IdentityType {
  ASSASSIN = 'ASSASSIN',
  GUARDIAN = 'GUARDIAN',
  LEADER = 'LEADER',
  TRAITOR = 'TRAITOR',
}

export type IdentityDistribution = {
  [IdentityType.LEADER]: 1;
} & {
  [identityType in IdentityType]: number;
};

export function distribution(players: number): IdentityDistribution {
  if (players < 4 || players > 8) {
    throw 'Treachery requires 4-8 players';
  }

  const counts: IdentityDistribution = {
    [IdentityType.LEADER]: 1,
    [IdentityType.TRAITOR]: 1,
    [IdentityType.ASSASSIN]: 2,
    [IdentityType.GUARDIAN]: 0,
  };

  if (players >= 8) {
    counts[IdentityType.TRAITOR] = 2;
  }

  if (players >= 6) {
    counts[IdentityType.ASSASSIN] = 3;
  }

  if (players >= 7) {
    counts[IdentityType.GUARDIAN] = 2;
  } else if (players >= 5) {
    counts[IdentityType.GUARDIAN] = 1;
  }

  return counts;
}

export type IdentityAssignment<T> = {
  userId: T;
  ability: any;
};

export async function* assign<T>(
  userIds: Array<T>,
  { notLeader }: { notLeader: Set<T> }
): AsyncGenerator<IdentityAssignment<T>> {
  const canBeLeader = userIds.filter((userId) => !notLeader.has(userId));
  const [leader] = pickRandom(canBeLeader);
  const everyoneElse = userIds.filter((userId) => userId !== leader);

  const identities = await IdentityDataSource.getIdentities();

  yield {
    userId: leader,
    ability: pickRandom(identities.leaders)[0],
  };

  const counts = distribution(userIds.length);
  const pool = [
    ...pickRandom(identities.traitors, { count: counts[IdentityType.TRAITOR] }),
    ...pickRandom(identities.assassins, {
      count: counts[IdentityType.ASSASSIN],
    }),
    ...pickRandom(identities.guardians, {
      count: counts[IdentityType.GUARDIAN],
    }),
  ];

  shuffleArray(pool);

  for (let i = 0; i < everyoneElse.length; ++i) {
    yield {
      userId: everyoneElse[i],
      ability: pool[i],
    };
  }
}
