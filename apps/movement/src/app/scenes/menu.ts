import { Scene, Timer } from 'excalibur';
import { Terrain } from '../entities/level';
import { PlayerActor } from '../entities/player';
import { ControlSystem } from '../systems/control';
import { DogActor } from '../entities/dog';

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    // new Shader({ fragmentSource, vertexSource, gl });
    const p = new PlayerActor();
    this.add(p);
    this.add(new Terrain());
    this.add(new Terrain({ x: 204, y: 100, width: 8, height: 140 }));
    this.world.add(new ControlSystem(this.world, this.engine.input));

    const dog = new DogActor();
    this.add(dog);

    const timer = new Timer({
      fcn: () => {
        dog.acc.x = p.pos.x > dog.pos.x ? 10 : -10;
      },
      randomRange: [250, 500],
      interval: 500,
      repeats: true,
    });
    this.add(timer);
    timer.start();
  }
}

export { MenuScene };
