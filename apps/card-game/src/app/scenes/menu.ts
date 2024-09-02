// import { fragmentSource, vertexSource } from '@shader/turbulence';
import { Scene } from 'excalibur';
import { CardActor } from '../entities/card';
import { DndSystem, DraggableComponent } from '../systems/control';

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    // new Shader({ fragmentSource, vertexSource, gl });
    this.add(new CardActor());
    this.world.add(new DndSystem(this.world, this.engine.input));

    this.input.keyboard.on("press", (evt) => {
      const draggables = this.world.query<typeof DraggableComponent>([DraggableComponent]);
      for (const entity of draggables.entities) {
        const drag = entity.get(DraggableComponent);
        drag.draggable = !drag.draggable;
      }
    });
  }
}

export { MenuScene };

