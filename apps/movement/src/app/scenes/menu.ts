import { Scene, Timer } from 'excalibur';
import { Terrain } from '../entities/level';
import { PlayerActor } from '../entities/player';
import { ControlSystem } from '../systems/control';
import { StrongmanActor } from '../entities/strongman';
import { DogActor } from '../entities/dog';
import { ControllableComponent } from '../components/controllable';

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    // new Shader({ fragmentSource, vertexSource, gl });
    const p = new PlayerActor();
    this.add(p);
    this.add(new Terrain({ x: 0, y: 120, width: 512, height: 16 }));
    this.add(new Terrain({ x: 204, y: 100, width: 8, height: 140 }));
    this.world.add(new ControlSystem(this.world, this.engine.input));

    this.camera.strategy.elasticToActor(p, 0.8, 0.9);
    this.camera.strategy.radiusAroundActor(p, 48);

    const s = new StrongmanActor();
    s.addComponent(new ControllableComponent());
    this.add(s);
    const dog = new DogActor();
    this.add(dog);

    s.on('pointerdown', () => {
      s.get(ControllableComponent).enabled = true;
      p.get(ControllableComponent).enabled = false;
      for (const strategy of this.camera._cameraStrategies) {
        strategy.target = s;
      }
    });
    p.on('pointerdown', () => {
      p.get(ControllableComponent).enabled = true;
      s.get(ControllableComponent).enabled = false;
      for (const strategy of this.camera._cameraStrategies) {
        strategy.target = p;
      }
    });

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
