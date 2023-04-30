import fetch from 'node-fetch';

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

class IdentityDataSourceImpl {
  _lastFetch: null | number;
  _identities: null | any;

  constructor() {
    this._lastFetch = null;
    this._identities = null;
  }

  async getIdentities() {
    if (this._lastFetch == null) {
      this._identities = await fetchIdentities();
      this._lastFetch = Date.now();
    } else if (Date.now() - this._lastFetch > kDuration_Day) {
      try {
        this._identities = await fetchIdentities();
        this._lastFetch = Date.now();
      } catch (error) {
        console.error('Failed to refresh data source with error:', error);
      }
    }

    return this._identities;
  }
}

export const IdentityDataSource = new IdentityDataSourceImpl();
