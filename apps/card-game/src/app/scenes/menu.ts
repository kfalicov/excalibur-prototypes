// import { fragmentSource, vertexSource } from '@shader/turbulence';
import { Actor, Scene, vec } from 'excalibur';
import { arrange } from '../../utils/arrange';
import { debounce } from '../../utils/debounce';
import { CardActor } from '../entities/card';
import { DndSystem, DraggableComponent } from '../systems/control';

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    // new Shader({ fragmentSource, vertexSource, gl });
    for (let i = 0; i < 5; i++) {
      const card = new CardActor(120, 240);
      card.addComponent(new DraggableComponent());
      this.add(card);
    }
    const hand = this.world.query<typeof DraggableComponent>([DraggableComponent]);
    this.world.add(new DndSystem(this.world, this.engine.input));


    const boardCenter = new Actor({
      pos: vec(this.engine.screen.resolution.width / 2, this.engine.screen.resolution.height / 2),
    })
    this.add(boardCenter);
    this.camera.strategy.elasticToActor(boardCenter, 0.2, 0.3);

    this.engine.screen.events.on('resize', debounce((evt) => {
      const { height, width } = evt.resolution;

      boardCenter.pos = vec(width / 2, height / 2);
      arrange(hand.entities, vec(0, 200), vec(width, 200));
    }, 180));
  }
}

export { MenuScene };

