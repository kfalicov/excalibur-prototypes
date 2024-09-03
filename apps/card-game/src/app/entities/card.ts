import {
  Actor,
  Color
} from 'excalibur';

class CardActor extends Actor {
  constructor(x: number, y: number) {
    super({
      x,
      y,
      width: 5 * 10,
      height: 7 * 10,
      // Let's give it some color with one of the predefined
      // color constants
      color: Color.Black,
    });
  }
}


export { CardActor };

