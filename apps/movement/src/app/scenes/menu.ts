import { Scene } from 'excalibur';
import { Terrain } from '../entities/level';
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
  }
}

export { MenuScene };
