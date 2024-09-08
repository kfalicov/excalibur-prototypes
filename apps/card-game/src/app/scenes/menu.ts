// import { fragmentSource, vertexSource } from '@shader/turbulence';
import { Actor, BoundingBox, Color, Debug, Scene, vec } from 'excalibur';
import { arrange } from '../../utils/arrange';
import { debounce } from '../../utils/debounce';
import { CardActor } from '../entities/card';
import { DndSystem, DraggableComponent } from '../systems/control';

const numColumns = 3;
const columnGap = 16;

class MenuScene extends Scene {
  onInitialize(): void {
    const gl = this.engine.canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    const screen = this.engine.screen;
    const cardWidth = () => ((screen.resolution.width - 64 - (16 * 4)) / 5);
    // new Shader({ fragmentSource, vertexSource, gl });
    for (let i = 0; i < 5; i++) {
      const card = new CardActor(screen.resolution.width - 100, screen.resolution.height - 100);
      card.addComponent(new DraggableComponent());
      CardActor.resize(card, cardWidth());
      this.add(card);
    }
    const hand = this.world.query<typeof DraggableComponent>([DraggableComponent]);
    this.world.add(new DndSystem(this.world, this.engine.input));

    arrange(hand.entities, vec(cardWidth() / 2, 200), vec(screen.resolution.width - (cardWidth() / 2), 200));

    const boardCenter = new Actor({
      pos: vec(screen.resolution.width / 2, screen.resolution.height / 2),
    })
    this.add(boardCenter);
    this.camera.strategy.lockToActor(boardCenter);

    this.engine.screen.events.on('resize', debounce((evt) => {
      const { height, width } = evt.resolution;

      boardCenter.pos = vec(width / 2, height / 2);
      hand.entities.forEach((entity, i) => {
        CardActor.resize(entity, cardWidth());
      });
      arrange(hand.entities, vec(cardWidth() / 2, 200), vec(width - (cardWidth() / 2), 200));
    }, 180));
  }
  onPostUpdate(): void {
    const { width, height } = this.engine.screen.resolution;
    const gaps = (numColumns - 1) * columnGap;
    const padding = 2 * columnGap;
    Debug.drawBounds(BoundingBox.fromDimension((width - gaps - padding) / numColumns,
      (height - padding), undefined, vec(width / 2, height / 2)), {
      color: Color.White,
    })
  }
}

export { MenuScene };

