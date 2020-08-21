import * as drop from './commands/drop';
import * as trail from './commands/trail';
import * as fade from './commands/fade';

export default class CommandManager {
  constructor(world, commandPrefix) {
    this.world = world;
    this.commandPrefix = commandPrefix;
    this.commands = new Map();

    this.registerCommand(drop);
    this.registerCommand(trail);
    this.registerCommand(fade);
  }

  registerCommand(command) {
    command.aliases.forEach((alias) => {
      this.commands.set(alias, command.handle);
    });
  }

  hasCommand(alias) {
    return this.commands.has(alias.toLowerCase());
  }

  getCommandHandler(alias) {
    return this.hasCommand(alias)
      ? this.commands.get(alias.toLowerCase())
      : undefined;
  }

  handleChatMessage(channel, tags, message, self) {
    if (self) return;
    if (!message.startsWith(this.commandPrefix)) return;

    const args = message.split(' ');
    const command = args.shift().slice(this.commandPrefix.length);

    if (this.hasCommand(command)) {
      this.getCommandHandler(command)({
        world: this.world,
        args,
        tags,
        message,
      });
    }
  }
}
