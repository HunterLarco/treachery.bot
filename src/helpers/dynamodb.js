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

  // Expiration is a timestamp expressed in seconds instead of a `Date` to
  // accomodate DynamoDB's TTL requirements.
  //
  // See https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-before-you-start.html
  expiration: Number,
});

module.exports = {
  Users: model('treachery-bot-users', UserSchema),
  Games: model('treachery-bot-games', GameSchema),
};
