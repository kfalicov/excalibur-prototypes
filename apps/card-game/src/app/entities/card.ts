import {
  Actor,
  Color
} from 'excalibur';
import { DraggableComponent } from '../systems/control';

class CardActor extends Actor {
  constructor() {
    super({
      x: 120,
      y: 80,
      width: 20,
      height: 20,
      // Let's give it some color with one of the predefined
      // color constants
      color: Color.Black,
    });
    this.body.friction = 0.1;
    this.addComponent(new DraggableComponent());
  }
}

export { CardActor };

