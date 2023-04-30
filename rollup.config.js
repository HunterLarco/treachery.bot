/**
 * Rollup is a Javascript bundler: meaning that it can "bundle" a bunch of JS
 * files into a single group of files for deployment. This same role is filled
 * on the frontend using "webpack".
 *
 * This file configures rollup to bundle the video-upload-worker into a single
 * file which can be deployed. It also configures local development hot
 * reloading of the video-upload-worker.
 *
 * When rollup is executed with `NODE_ENV=development` it will start and hot
 * reload the binary. When `NODE_ENV=production` it will instead build the
 * binary and emit the result to dist/.
 */

const generatePackageJson = require('rollup-plugin-generate-package-json');
const run = require('@rollup/plugin-run');
const typescript = require('@rollup/plugin-typescript');
const copy = require('rollup-plugin-copy');

/**
 * Creates a list of plugins to be used when hot-reloading the binary generated
 * by this rollup config.
 */
const createHotReloadPlugins = () => [run()];

/**
 * Creates a list of plugins to be used when building a deployable binary. This
 * plugins differ from those used by `createHotReloadPlugins` in that we can
 * often skip productionization plugins when hot reloading a local server.
 */
const createBuildPlugins = () => {
  return [
    copy({
      targets: [{ src: 'Dockerfile', dest: 'dist/' }],
    }),
    generatePackageJson(),
  ];
};

module.exports = {
  input: 'src/index.ts',
  output: {
    file: 'dist/server.cjs',
    format: 'cjs',
    sourcemap: 'inline',
  },

  // Rollup will only resolve relative module IDs by default. This means that an
  // import statement like this…
  //
  // ```
  // import moment from 'moment';
  // ```
  //
  // ...won't result in moment being included in our bundle – instead, it will
  // be an external dependency that is required at runtime. Rollup warns us when
  // it finds non-relative packages so that we have the opportunity to
  // explicitly declare if the dependency should be bundled. Packages marked
  // here will not be included in the bundle. Instead we will install them using
  // `npm install`.
  //
  // See https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency
  external: [
    'discord.js',
    'dotenv',
    'dynamoose',
    'express',
    'fast-glob',
    'path',
  ],

  plugins: [
    typescript({
      compilerOptions: {
        // When building for prod we dont want to output a broken build, however
        // during development it's valuable to emit broken builds for the watch
        // binary to detect and log.
        noEmitOnError: process.env.NODE_ENV != 'development',
      },
    }),
    process.env.NODE_ENV === 'development'
      ? createHotReloadPlugins()
      : createBuildPlugins(),
  ],

  watch: {
    // Hot reloading at instant speed can cause port contention when doing large
    // find-and-replace operations or saving several times in succession. So we
    // add a small debounce timer.
    buildDelay: 500,
  },
};
