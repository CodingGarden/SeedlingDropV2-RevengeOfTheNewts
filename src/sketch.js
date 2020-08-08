/* eslint-disable no-param-reassign */

import tmi from 'tmi.js';
import Drop from './Drop';
import ImageManager from './ImageManager';
import config from './config';

const client = new tmi.Client({
	connection: {
		secure: true,
		reconnect: true
	},
	channels: [ 'codinggarden' ]
});

client.connect();				

/**
 * @param {import('p5')} p5
 */
export default function sketch(p5) {
  let drops = [];
  const imageManager = new ImageManager(p5);
  let trailing = false;

  client.on('message', async (channel, tags, message, self) => {
    if (tags.username === 'codinggarden') {
      if (message === '!start-trail') return trailing = true;
      else if (message === '!end-trail') return trailing = false;
      else if (message.match(/^\!drop\-timeout/)) {
        const timeout = Number(message.split(' ')[1]);
        if (!isNaN(timeout)) {
          config.dropTimeout = timeout * 1000;
        }
      }
    }

    if (message.startsWith('!drop') && tags.emotes) {
      const emoteIds = Object.keys(tags.emotes);
      const emoteId = p5.random(emoteIds);
      const imageUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/2.0`;
      const image = await imageManager.getImage(imageUrl);
      drops.push(new Drop(p5, image));
    }
  });

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    const image = await imageManager.getImage('https://static-cdn.jtvnw.net/emoticons/v1/303121909/2.0');
    drops = Array.from({ length: 1000 }, () => {
      return new Drop(p5, image);
    });
  };
  p5.draw = () => {
    if (!trailing) p5.clear();
    const now = Date.now();
    drops = drops.filter((drop) => {
      drop.update();
      return !drop.draw(now);
    });
  };
}
