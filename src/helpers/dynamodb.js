const { model, Schema } = require('dynamoose');

const UserSchema = new Schema({
  userId: String,
  currentGame: String,
});

const AbilitySchema = new Schema({
  name: String,
  types: new Schema({
    supertype: String,
    subtype: String,
  }),
  uri: String,
  image: String,
  text: String,
});

const PlayerSchema = new Schema({
  userId: String,
  ability: AbilitySchema,
});

const GameSchema = new Schema({
  key: String,
  startTime: Date,
  players: {
    type: Array,
    schema: [PlayerSchema],
  },
});

module.exports = {
  Users: model('treachery-bot-users', UserSchema),
  Games: model('treachery-bot-games', GameSchema),
};
