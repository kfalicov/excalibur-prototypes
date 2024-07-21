import {
  Actor,
  CollisionType,
  Color,
  Engine,
} from 'excalibur';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';
import { CollisionGroup } from '../systems/collision';

class PlayerActor extends Actor {
  constructor({ x = 120, y = 80 }: { x?: number, y?: number } = {}) {
    super({
      x,
      y,
      width: 20,
      height: 20,
      // Let's give it some color with one of the predefined
      // color constants
      color: Color.Black,
      collisionType: CollisionType.Active,
      collisionGroup: CollisionGroup.Player,
    });
  }
  onInitialize(engine: Engine): void {
    this.body.friction = 0.9;
    this.body.useGravity = true;
    this.addComponent(new MobilityComponent());
    this.addComponent(new TouchingComponent());
  }
}

export { PlayerActor };

