import { Actor, ParallaxComponent, Scene, vec } from 'excalibur';
import { Terrain } from '../entities/level';
import { PlayerActor } from '../entities/clown/player';
import { ControlSystem } from '../systems/control';
import { ControllableComponent } from '../components/controllable';
import { ComboSystem } from '../systems/combo';
import { ProjectileFactory } from '../utils/projectile-factory';
import { AISystem } from '../systems/ai';
import { Resources } from '../resources/resources';

const parallaxLayers = [
  Resources.skybox,
  Resources.cloud,
  Resources.hills,
  Resources.trees,
];

class MenuScene extends Scene {
  projectileFactory = new ProjectileFactory(this);

  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    // new Shader({ fragmentSource, vertexSource, gl });

    for (let i = 0; i < parallaxLayers.length; i++) {
      const layer = parallaxLayers[i]!;
      const bg = new Actor({ x: 0, y: -20 });
      bg.scale = vec(0.5, 0.5);
      bg.graphics.anchor = vec(0.5, 0.5);
      bg.graphics.use(
        layer.toSprite({
          sourceView: { x: 0, y: 0, width: 1024, height: 324 },
        }),
      );
      bg.addComponent(
        new ParallaxComponent(vec(0.015 + 0.25 * i, 0.015 + 0.05 * i)),
      );
      this.add(bg);
    }

    const p = new PlayerActor();
    p.body.enableFixedUpdateInterpolate = false;

    this.add(p);
    this.add(new Terrain({ x: 0, y: 120, width: 512, height: 16 }));
    this.add(new Terrain({ x: 90, y: 60, width: 40, height: 16 }));
    this.add(new Terrain({ x: 204, y: 100, width: 8, height: 140 }));
    this.world.add(new ControlSystem(this.world, this.engine.input, this));
    this.world.add(new ComboSystem(this.world, this.input));
    this.world.add(AISystem);

    this.camera.strategy.elasticToActor(p, 0.8, 0.9);
    this.camera.strategy.radiusAroundActor(p, 48);

    p.on('pointerdown', () => {
      p.get(ControllableComponent).enabled = true;
      for (const strategy of this.camera._cameraStrategies) {
        strategy.target = p;
      }
    });
  }
}

export { MenuScene };
