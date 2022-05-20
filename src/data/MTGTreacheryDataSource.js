const fetch = require('node-fetch');

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
    this._identities = null;
  }

  async getIdentities() {
    if (!this._identities) {
      this._identities = await fetchIdentities();
    }
    return this._identities;
  }
}

module.exports = {
  IdentityDataSource: new IdentityDataSource(),
};
