export default class ImageManager {
  /**
   * @param {import('p5')} p5
   */
  constructor(p5) {
    this.p5 = p5;
    this.cache = new Map();
  }

  async getImage(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    const imagePromise = new Promise((resolve) => {
      this.p5.loadImage(url, (image) => {
        this.cache.set(url, image);
        resolve(image);
      });
    });
    this.cache.set(url, imagePromise);
    return imagePromise;
  }
}