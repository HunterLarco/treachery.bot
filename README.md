# Treachery Bot

<img
  src="https://mtgtreachery.net/images/drama-masks-colored-with-borders.png"
  height="100" />

![](https://github.com/hunterlarco/treachery.bot/workflows/prettier/badge.svg)

## Contributing

### Install project dependencies

All dependencies can be installed via `npm install`.

### Local Development

You will need to create `src/config.private.json` which contains the following

```json
{
  "prefix": "<command prefix>",
  "token": "<bot token>"
}
```

then you can run

```sh
npm start
```

#### Code Formatting

Code will automatically be linted when you run `git commit` and as a required
status check for all PRs. You can lint the codebase yourself with

```sh
npm run check-code
```

and you can automatically fix your code with

```sh
npm run format-code
```

### Pull Requests

Please submit all contributions via pull requests where your branch matches the
pattern `<username>/<branch-name>`.
