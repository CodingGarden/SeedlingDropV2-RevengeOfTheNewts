import config from '../config';

module.exports = {
  aliases: ['set-fade', 'fade-set'],
  handle: ({ tags, args }) => {
    if (tags.badges && tags.badges.broadcaster) {
      if (!isNaN(args[0])) {
        config.dropTimeout = Number(args[0]) * 1000;
      }
    }
  },
};
