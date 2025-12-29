# Treachery Bot

<img
  src="https://mtgtreachery.net/images/drama-masks-colored-with-borders.png"
  height="100" />

![](https://github.com/hunterlarco/treachery.bot/workflows/release/badge.svg)

## Using The Bot

[Add the bot to your discord server][bot-install] and then use `~help`.

## Contributing

### Using the correct Node version

```sh
nvm use
```

### Install project dependencies

All dependencies can be installed via `npm install`.

### Local Development

Local development requires a few environment variables to configure the bot. See
[environment.js](./src/helpers/environment.js) for more details.

.env

```sh
BOT_TOKEN='...'
BOT_CLIENT_ID='...'
AWS_REGION='...'
DEBUG=true
```

npm start

#### Code Formatting

Code will automatically be linted when you run `git commit` and as a required
status check for all PRs. You can lint the codebase yourself with

```sh
npm run lint
```

and you can automatically fix your code with

```sh
npm run lint:fix
```

### Pull Requests

Please submit all contributions via pull requests where your branch matches the
pattern `<username>/<branch-name>`.

[bot-install]: https://discord.com/oauth2/authorize?client_id=777746848123191296
