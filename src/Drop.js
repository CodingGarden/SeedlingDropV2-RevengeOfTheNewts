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
    this.wobble = p5.random(p5.TAU);
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
    // translate to the point we want to rotate around, which is the top center of the drop
    this.p5.translate(this.position.x, this.position.y - this.image.height / 2);
    // rotate by the drops wobble value mapped between -PI/16 and PI/16
    this.p5.rotate(this.p5.map(this.p5.sin(this.wobble), -1, 1, -this.p5.QUARTER_PI / 2, this.p5.QUARTER_PI / 2));
    // translate down from the rotate point to the draw point (center)
    this.p5.translate(0, this.image.height / 2);
    this.p5.image(
      this.image,
      0, 0,
    );
    this.p5.pop();

    return alpha <= 0;
  }

  update() {
    const {
      position, velocity, p5, image, landed,
    } = this;
    if (landed) return;
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
    this.wobble += p5.random(0.05, 0.1);
  }
}
