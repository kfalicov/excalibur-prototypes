import { fragmentSource, vertexSource } from "@shader/turbulence";
import { Scene, Shader } from 'excalibur';
import { Terrain } from "../entities/level";
import { PlayerActor } from '../entities/player';
import { ControlSystem } from '../systems/control';

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    new Shader({ fragmentSource, vertexSource, gl });
    this.add(new PlayerActor());
    this.add(new Terrain());
    this.world.add(new ControlSystem(this.world, this.engine.input));
  }
}

export { MenuScene };

