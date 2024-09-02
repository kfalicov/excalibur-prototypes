// import { fragmentSource, vertexSource } from '@shader/turbulence';
import { Scene } from 'excalibur';
import { CardActor } from '../entities/card';
import { DndSystem } from '../systems/control';

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    // new Shader({ fragmentSource, vertexSource, gl });
    this.add(new CardActor());
    this.world.add(new DndSystem(this.world, this.engine.input));
  }
}

export { MenuScene };

