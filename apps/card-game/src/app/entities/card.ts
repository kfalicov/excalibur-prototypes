import {
  Actor,
  ColliderComponent,
  Entity
} from 'excalibur';

class CardActor extends Actor {
  constructor(x: number, y: number) {
    super({
      x,
      y,
      // Let's give it some color with one of the predefined
      // color constants
      // color: Color.Black,
    });
    const { width, height } = this.scene?.engine.screen.resolution ?? {};
    console.log(width, height);
    this.get(ColliderComponent).useBoxCollider(5 * 20, 7 * 20);
  }
  static resize(card: Entity, width: number) {
    card.get(ColliderComponent).useBoxCollider(width, width / 5 * 7);
  }
}


export { CardActor };

