import glob from 'fast-glob';
import * as path from 'path';

export async function loadFromDirectory(directory: string) {
  const files = await glob([path.join(directory, '/*.js')], {
    absolute: true,
    followSymbolicLinks: false,
    onlyFiles: true,
  });

  return files.map((file) => require(file));
}
