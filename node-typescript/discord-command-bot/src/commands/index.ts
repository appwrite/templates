import { readdirSync } from 'fs';
import { join } from 'path';

const commands = new Map();

const commandFiles = readdirSync(__dirname).filter((file) =>
  file.endsWith('.js')
);

for (const file of commandFiles) {
  const command = require(join(__dirname, file));
  const commandName = file.split('.')[0];
  commands.set(commandName, command.default);
}

export default commands;
