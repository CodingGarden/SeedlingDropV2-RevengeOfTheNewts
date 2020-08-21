import config from '../config';

module.exports = {
  aliases: config.dropCommands,
  handle: ({ world, tags, args, message }) => {
    world.doDrop({ args, tags, message });
  },
};
