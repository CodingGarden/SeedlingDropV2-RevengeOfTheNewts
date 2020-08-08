import { Vector } from 'p5';
import config from './config';

export default class Drop {
  /**
   * @param {import('p5')} p5
   * @param {import('p5').Image} image
   */
  constructor(p5, image) {
    this.p5 = p5;
    this.image = image;
    this.landed = false;
    this.wobble = 0;
    this.size = 56
    this.position = p5.createVector(
      p5.random(0, p5.windowWidth - image.width),
      -100,
    );
    this.velocity = Vector.fromAngle(
      p5.random(p5.PI * 0.1, p5.PI * 0.9),
      p5.random(3, 7),
    );
  }

  draw(now) {
    let alpha = 1;
    this.p5.push();
    if (this.landed) {
      const diff = now - this.landTime;
      alpha = diff >= config.dropTimeout ? 0 : this.p5.map(diff, config.dropTimeout, 0, 0, 1);
      this.p5.drawingContext.globalAlpha = alpha;
    }
    this.p5.translate(this.position.x, this.position.y-this.size/2);
    this.p5.rotate(this.p5.map(this.p5.sin(this.wobble), -1, 1, -this.p5.QUARTER_PI/2, this.p5.QUARTER_PI/2));
    this.p5.translate(0, this.size/2);
    this.p5.image(
      this.image,
      0,0
    );
    this.p5.pop();

    return alpha <= 0;
  }

  update() {
    const { position, velocity, p5, image, landed } = this;
    if (landed) return this.wobble = 0;
    position.add(velocity);
    if (position.x <= 0) {
      velocity.mult(-1, 1);
    } else if ((position.x + image.width) >= p5.windowWidth) {
      velocity.mult(-1, 1);
      position.x = p5.windowWidth - image.width;
    }

    if (position.y + image.height >= p5.windowHeight) {
      position.y = p5.windowHeight - image.height;
      this.landed = true;
      this.landTime = Date.now();
    }
    this.wobble+=.05
  }
}