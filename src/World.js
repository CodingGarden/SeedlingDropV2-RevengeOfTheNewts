import config from './config';
import UserManager from './UserManager';
import ImageManager from './ImageManager';
import Drop from './Drop';
import clipImage from './white_circle.png';
import gardenImage from './grass-target.png';

export default class World {
  /**
   * @param {import('p5')} p5
   */
  constructor(p5) {
    this.p5 = p5;
    this.drops = [];
    this.dropQueue = [];
    this.trailing = false;
    this.userManager = new UserManager();
    this.imageManager = new ImageManager(p5);

    this.draw = this.draw.bind(this);
    this.p5.loadImage(gardenImage, (image) => {
      this.gardenImage = image;
      this.gardenWidth = image.width / 1.25;
    });
  }

  draw() {
    const { p5, trailing, dropQueue } = this;
    let { drops } = this;
    if (trailing) {
      p5.background('rgba(0, 0, 0, 0.05)');
    } else {
      p5.clear();
    }
    if (this.gardenImage) {
      this.p5.push();
      this.p5.imageMode(p5.CENTER);
      this.p5.image(
        this.gardenImage,
        p5.windowWidth / 2,
        p5.windowHeight + 12,
        this.gardenWidth,
        this.gardenImage.height / 1.25,
      );
      this.p5.pop();
    }
    const now = Date.now();
    drops = drops.filter((drop) => {
      drop.update();
      if (drop.landed) {
        const leftEdge = this.p5.windowWidth / 2 - this.gardenWidth / 2;
        const rightEdge = this.p5.windowWidth / 2 + this.gardenWidth / 2;
        if (drop.position.x >= leftEdge && drop.position.x <= rightEdge) {
          drop.inGarden = true;
        }
      }
      return !drop.draw(now);
    });
    if (drops.length <= config.maxVisibleDrops) {
      const end = config.maxVisibleDrops - drops.length;
      drops = drops.concat(dropQueue.slice(0, end));
      this.dropQueue = dropQueue.slice(end);
    }
    this.drops = drops;
  }

  async doDrop({ tags, message }) {
    if (tags.emotes) {
      const emoteIds = Object.keys(tags.emotes);
      const emoteId = this.p5.random(emoteIds);
      const imageUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/2.0`;
      const image = await this.imageManager.getImage(imageUrl);
      this.queueDrop(image);
    } else if (message.match(/\bme\b/)) {
      const userId = tags['user-id'];
      const user = await this.userManager.getUser(userId);
      if (Date.now() - new Date(user.created_at) >= config.minAccountAge) {
        // TODO: make sure this sizing doesn't break...
        const imageUrl = user.logo.replace('300x300', '50x50');
        const image = await this.imageManager.getImage(imageUrl);
        const clip = await this.imageManager.getImage(clipImage);
        image.mask(clip);
        this.queueDrop(image);
      }
    }
  }

  queueDrop(image) {
    if (this.drops.length <= config.maxVisibleDrops) {
      this.drops.push(new Drop(this.p5, image));
    } else {
      this.dropQueue.push(new Drop(this.p5, image));
    }
  }
}
