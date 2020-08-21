import config from "./config";
import UserManager from "./UserManager";
import ImageManager from "./ImageManager";
import CommandManager from "./CommandManager";
import Drop from "./Drop";
import clipImage from "./white_circle.png";

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
    this.commandManager = new CommandManager(this, config.commandPrefix);
  }

  draw() {
    const { p5, trailing, drops, dropQueue } = this;
    if (!trailing) p5.clear();
    const now = Date.now();
    this.drops = drops.filter((drop) => {
      drop.update();
      return !drop.draw(now);
    });
    if (this.drops.length <= config.maxVisibleDrops) {
      const end = config.maxVisibleDrops - this.drops.length;
      this.drops = this.drops.concat(dropQueue.slice(0, end));
      this.dropQueue = dropQueue.slice(end);
    }
  }

  async doDrop({ tags, message }) {
    if (tags.emotes) {
      const emoteIds = Object.keys(tags.emotes);
      const emoteId = this.p5.random(emoteIds);
      const imageUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/2.0`;
      const image = await this.imageManager.getImage(imageUrl);
      this.queueDrop(image);
    } else if (message.match(/\bme\b/)) {
      const userId = tags["user-id"];
      const user = await this.userManager.getUser(userId);
      if (Date.now() - new Date(user.created_at) >= config.minAccountAge) {
        // TODO: make sure this sizing doesn't break...
        const imageUrl = user.logo.replace("300x300", "50x50");
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
