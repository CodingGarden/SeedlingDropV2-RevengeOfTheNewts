/* eslint-disable no-param-reassign */

import tmi from 'tmi.js';
import clipImage from './white_circle.png';
import Drop from './Drop';
import ImageManager from './ImageManager';
import config from './config';
import UserManager from './UserManager';

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
  let dropQueue = [];
  const imageManager = new ImageManager(p5);
  const userManager = new UserManager();
  let trailing = false;

  const queueDrop = (image) => {
    if (drops.length <= config.maxVisibleDrops) {
      drops.push(new Drop(p5, image));
    } else {
      dropQueue.push(new Drop(p5, image));
    }
  };

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

    if (message.startsWith('!drop') || message.startsWith('!derp')) {
      if (tags.emotes) {
        const emoteIds = Object.keys(tags.emotes);
        const emoteId = p5.random(emoteIds);
        const imageUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/2.0`;
        const image = await imageManager.getImage(imageUrl);
        queueDrop(image);
      } else if (message.match(/\bme\b/)) {
        const userId = tags['user-id'];
        const user = await userManager.getUser(userId);
        if (Date.now() - new Date(user.created_at) >= config.minAccountAge) {
          // TODO: make sure this sizing doesn't break...
          const imageUrl = user.logo.replace('300x300', '50x50');
          const image = await imageManager.getImage(imageUrl);
          const clip = await imageManager.getImage(clipImage);
          image.mask(clip);
          queueDrop(image);
        }
      }
    }
  });

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);
    if (config.test) {
      const images = await Promise.all([
        'https://static-cdn.jtvnw.net/emoticons/v1/303046121/2.0',
        'https://static-cdn.jtvnw.net/emoticons/v1/302039277/2.0',
        'https://static-cdn.jtvnw.net/emoticons/v1/301988022/2.0',
        // 'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/2x',
        // 'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/5abc0096a05ad63caeccbe58/2x',
        // 'https://cors-anywhere.herokuapp.com/https://cdn.betterttv.net/emote/59f06613ba7cdd47e9a4cad2/2x',
      ].map(url => imageManager.getImage(url)));
      drops = Array.from({ length: 10 }).reduce((drops) => {
        return drops.concat(images.map(image => new Drop(p5, image)));
      }, []);
    }
  };
  p5.draw = () => {
    if (!trailing) p5.clear();
    const now = Date.now();
    drops = drops.filter((drop) => {
      drop.update();
      return !drop.draw(now);
    });
    if (drops.length <= config.maxVisibleDrops) {
      const end = config.maxVisibleDrops - drops.length;
      drops = drops.concat(dropQueue.slice(0, end))
      dropQueue = dropQueue.slice(end);
    }
  };
}
