import {
  Actor,
  CollisionType,
  Color,
  Engine
} from 'excalibur';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';
import { CollisionGroup } from '../utils/collision';

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

  // onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  //   if (side === Side.Bottom) {
  //     self.owner.get(BodyComponent).vel.y = 0;
  //   }
  //   if (side === Side.Left || side === Side.Right) {
  //     self.owner.get(BodyComponent).vel.x = 0;
  //   }
  // }
}

export { PlayerActor };

