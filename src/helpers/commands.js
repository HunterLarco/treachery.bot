const Discord = require('discord.js');
const glob = require('fast-glob');
const path = require('path');

async function loadFromDirectory(directory) {
  const collection = new Map();

  const files = await glob([path.join(directory, '/*.js')], {
    absolute: true,
    followSymbolicLinks: false,
    onlyFiles: true,
  });

  for (const file of files) {
    const command = require(file);
    collection.set(command.name, command);
  }

  return collection;
}

module.exports = {
  loadFromDirectory,
};
