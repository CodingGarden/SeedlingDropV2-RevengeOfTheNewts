import { Vector } from 'p5';
import config from './config';

export default class Drop {
  /**
   * @param {import('p5')} p5
   * @param {import('p5').Image} image
   * @param {boolean} trailing
   */
  constructor(p5, image, trailing) {
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

    this.trailing = trailing;
    this.history = [];
    this.translation = p5.createVector(0, 0);
    this.rotation = 0;
  }

  draw(now) {
    let alpha = 1;
    this.p5.push();
    if (this.landed) {
      const diff = now - this.landTime;
      alpha = diff >= config.dropTimeout ? 0 : this.p5.map(diff, config.dropTimeout, 0, 0, 1);
      this.p5.drawingContext.globalAlpha = alpha;
      this.history.splice(0, 1);
    }
    this.p5.translate(this.translation.x, this.translation.y);
    this.p5.rotate(this.rotation);
    // translate down from the rotate point to the draw point (center)
    this.p5.translate(0, this.image.height / 2);
    this.p5.image(
      this.image,
      0, 0,
    );
    this.p5.pop();

    if (this.trailing) {
      for (let i = 0; i < this.history.length; i += 1) {
        this.p5.push();
        const { translation, rotation } = this.history[i];
        this.p5.drawingContext.globalAlpha = i / this.history.length;
        this.p5.translate(translation.x, translation.y);
        this.p5.rotate(rotation);
        this.p5.translate(0, this.image.height / 2);
        this.p5.image(this.image, 0, 0);
        this.p5.pop();
      }
    }

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

    // translate to the point we want to rotate around, which is the top center of the drop
    this.translation = p5.createVector(position.x, position.y - image.height / 2);
    // rotate by the drops wobble value mapped between -PI/16 and PI/16
    this.rotation = p5.map(p5.sin(this.wobble), -1, 1, -p5.QUARTER_PI / 2, p5.QUARTER_PI / 2);

    // keep trailing history
    this.history.push({
      translation: this.translation,
      rotation: this.rotation,
    });

    if (this.history.length >= config.trailLength) {
      this.history.splice(0, 1);
    }
  }
}
