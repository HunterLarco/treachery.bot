import * as dynamoose from 'dynamoose';

const UserSchema = new dynamoose.Schema({
  userId: String,
  currentGame: String,
});

const AbilitySchema = new dynamoose.Schema({
  name: String,
  types: new dynamoose.Schema({
    supertype: String,
    subtype: String,
  }),
  uri: String,
  image: String,
  text: String,
});

const PlayerSchema = new dynamoose.Schema({
  userId: String,
  ability: AbilitySchema,
});

const GameSchema = new dynamoose.Schema({
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

export const Users = dynamoose.model('treachery-bot-users', UserSchema);

export const Games = dynamoose.model('treachery-bot-games', GameSchema);
