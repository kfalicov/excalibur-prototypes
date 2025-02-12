import { Actor, Color, Scene } from 'excalibur';
import { Terrain } from '../entities/level';
import { fragmentSource } from '@shader/outline';
import { PlayerActor } from '../entities/player';
import { ControlSystem } from '../systems/control';

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    // new Shader({ fragmentSource, vertexSource, gl });
    this.add(new PlayerActor());
    this.add(new Terrain());
    this.add(new Terrain({ x: 204, y: 100, width: 8, height: 140 }));
    this.world.add(new ControlSystem(this.world, this.engine.input));

    const waterMaterial = this.engine.graphicsContext.createMaterial({
      name: 'water',
      fragmentSource,
      color: Color.fromRGB(55, 0, 200, 0.6),
    });
    const reflection = new Actor({
      x: 0,
      y: this.engine.screen.resolution.height / 2,
    });
    reflection.graphics.material = waterMaterial;
  }
}

export { MenuScene };
