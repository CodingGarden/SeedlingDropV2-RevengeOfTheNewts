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

  client.on('message', (channel, tags, message, self) =>
    world.commandManager.handleChatMessage(channel, tags, message, self)
  );

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);
    if (config.test) {
      const images = await Promise.all(
        [
          'https://static-cdn.jtvnw.net/emoticons/v1/303046121/2.0',
          'https://static-cdn.jtvnw.net/emoticons/v1/302039277/2.0',
          'https://static-cdn.jtvnw.net/emoticons/v1/301988022/2.0',
          'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/2x',
          'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5abc0096a05ad63caeccbe58/2x',
          'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/59f06613ba7cdd47e9a4cad2/2x',
        ].map((url) => world.imageManager.getImage(url))
      );
      world.drops = Array.from({ length: 10 }).reduce(
        (drops) => drops.concat(images.map((image) => new Drop(p5, image))),
        []
      );
    }
  };
  p5.draw = world.draw;
}
