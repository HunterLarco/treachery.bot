const fetch = require('node-fetch');

const kDuration_Day = 24 * 60 * 60 * 1000;

async function fetchIdentities() {
  const { cards } = await fetch(
    'https://mtgtreachery.net/rules/oracle/treachery-cards.json'
  ).then((response) => response.json());

  return {
    assassins: cards.filter((card) => card.types.subtype == 'Assassin'),
    guardians: cards.filter((card) => card.types.subtype == 'Guardian'),
    leaders: cards.filter((card) => card.types.subtype == 'Leader'),
    traitors: cards.filter((card) => card.types.subtype == 'Traitor'),
  };
}

class IdentityDataSource {
  constructor() {
    this._lastFetch = null;
    this._identities = null;
  }

  async getIdentities() {
    if (!this._identities || Date.now() - this._lastFetch > kDuration_Day) {
      try {
        this._identities = await fetchIdentities();
      } catch (error) {
        if (this._identities) {
          console.error('Failed to refresh data source with error:', error);
          return this._identities;
        }
        throw error;
      }
      this._lastFetch = Date.now();
    }
    return this._identities;
  }
}

module.exports = {
  IdentityDataSource: new IdentityDataSource(),
};
