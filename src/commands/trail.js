module.exports = {
  aliases: ["trail"],
  handle: ({ world, tags }) => {
    if (tags.badges && tags.badges.broadcaster)
      world.trailing = !world.trailing;
  },
};
