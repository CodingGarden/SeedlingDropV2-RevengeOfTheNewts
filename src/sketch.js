/* eslint-disable no-param-reassign */

import tmi from 'tmi.js';
import Drop from './Drop';
import config from './config';
import World from './World';

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [config.channelName],
});

client.connect();

const validDropCommands = new Set(config.dropCommands);

/**
 * @param {import('p5')} p5
 */
export default function sketch(p5) {
  const world = new World(p5);

  client.on('message', async (channel, tags, message, self) => {
    if (self) return;
    if (!message.startsWith(config.commandPrefix)) return;
    const args = message.split(' ');
    const command = args.shift().slice(config.commandPrefix.length);
    if (validDropCommands.has(command)) {
      world.doDrop({ args, tags, message });
    } else if (tags.badges && tags.badges.broadcaster) {
      if (command === 'trail') world.trailing = !world.trailing;
      else if (['start-trail', 'trail-start'].includes(command)) world.trailing = true;
      else if (['end-trail', 'trail-end'].includes(command)) world.trailing = false;
      else if (command === 'drop-timeout') {
        const timeout = Number(message.split(' ')[1]);
        if (!isNaN(timeout)) {
          config.dropTimeout = timeout * 1000;
        }
      }
    }
  });

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);
    if (config.test) {
      const cjmotes = [
        '303121909', '303117821', '303105450', '303105372', '303105326', '303046121', '303045914', '303008478', '303007613', '303007583',
        '303007350', '303007238', '303007169', '303007002', '303006986', '303006827', '303006625', '303006622', '303006621', '303006610',
        '302958222', '302039277', '301996771', '301988022', '301987997', '301980461', '303007794', '301988100', '301980473',
      ].map((num) => `https://static-cdn.jtvnw.net/emoticons/v1/${num}/2.0`);
      const images = await Promise.all(
        [
          ...cjmotes,
          // 'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/2x',
          // 'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5abc0096a05ad63caeccbe58/2x',
          // 'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/59f06613ba7cdd47e9a4cad2/2x',
        ].map((url) => world.imageManager.getImage(url)),
      );
      world.drops = Array.from({ length: 1 }).reduce(
        (drops) => drops.concat(images.map((image) => new Drop(p5, image, true))),
        [],
      );
    }
  };
  p5.draw = world.draw;
}
