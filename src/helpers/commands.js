const Discord = require('discord.js');
const glob = require('fast-glob');
const path = require('path');

async function loadFromDirectory(directory) {
  const files = await glob([path.join(directory, '/*.js')], {
    absolute: true,
    followSymbolicLinks: false,
    onlyFiles: true,
  });

  return files.map((file) => require(file));
}

module.exports = {
  loadFromDirectory,
};
