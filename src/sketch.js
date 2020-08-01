/* eslint-disable no-param-reassign */

import tmi from 'tmi.js';
import Drop from './Drop';
import ImageManager from './ImageManager';


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
  const imageUrl = 'https://static-cdn.jtvnw.net/emoticons/v1/303121909/4.0';
  const drops = [];
  const imageManager = new ImageManager(p5);

  client.on('message', async (channel, tags, message, self) => {
    if (message.startsWith('!drop') && tags.emotes) {
      const emoteIds = Object.keys(tags.emotes);
      const emoteId = p5.random(emoteIds);
      const imageUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/4.0`;
      const image = await imageManager.getImage(imageUrl);
      drops.push(new Drop(p5, image));
    }
  });

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
  };
  p5.draw = () => {
    p5.clear();
    drops.forEach((drop) => {
      drop.draw();
      drop.update();
    });
  };
}
