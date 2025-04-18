import { Actor, Canvas, Engine, Vector } from 'excalibur';

import { ParticleSystem } from '../systems/web-gpu-particles';

class ParticleDisplayActor extends Actor {
  constructor(x: number, y: number) {
    super({
      pos: new Vector(x, y),
    });
  }

  onInitialize(engine: Engine) {
    const canvas = new Canvas({
      width: 128,
      height: 128,
      cache: false,
      draw: (ctx) => {
        ctx.drawImage(ParticleSystem.canvas, 0, 0);
      },
    });
    this.graphics.use(canvas);
  }

  onPreUpdate(engine, delta) {
    ParticleSystem.update();
  }
}

export { ParticleDisplayActor };
