import {
  Actor,
  ColliderComponent,
  CollisionType,
  Color,
  Engine,
  Shape,
  vec,
  Vector,
} from 'excalibur';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';
import { CollisionGroup } from '../utils/collision';

/**
 * sweeps a polygon p along another polygon q by using minkowski to sum the two polygons.
 * @param p the first polygon
 * @param q the second polygon
 */
function minkowski(p: Vector[], q: Vector[]): Vector[] {
  if (p.length === 0 || q.length === 0) {
    throw 'Both polygons must have at least one vertex';
  }

  // Ensure cyclic ordering by finding the vertex with the lowest y-coordinate (and lowest x if tied)
  const findStartingVertex = (polygon: Vector[]) => {
    const { index } = polygon.reduce(
      (acc, cur, index) => {
        if (!acc.vertex || cur.y < acc.vertex.y) {
          return { index, vertex: cur };
        } else if (cur.y === acc.vertex.y && cur.x < acc.vertex.x) {
          return { index, vertex: cur };
        }
        return acc;
      },
      { index: 0, vertex: polygon[0] },
    );
    return index;
  };

  const startP = findStartingVertex(p);
  const startQ = findStartingVertex(q);

  const cyclicNext = (index, length) => (index + 1) % length;

  const result: Vector[] = [];
  let i = startP;
  let j = startQ;

  /**
   * safety mechanism to guarantee no runaway while loop. It should never run
   * more than p.length + q.length times, as by then all vertices should have been covered
   */
  let cap = 0;

  do {
    result.push(p[i].clone().add(q[j]));

    const edgeP: Vector = p[cyclicNext(i, p.length)].clone().sub(p[i]);
    const edgeQ: Vector = q[cyclicNext(j, q.length)].clone().sub(q[j]);

    const cross = edgeP.cross(edgeQ);

    if (cross > 0) {
      i = cyclicNext(i, p.length);
    } else if (cross < 0) {
      j = cyclicNext(j, q.length);
    } else {
      i = cyclicNext(i, p.length);
      j = cyclicNext(j, q.length);
    }
    cap++;
  } while ((i !== startP || j !== startQ) && cap < p.length + q.length);

  return result;
}

class PlayerActor extends Actor {
  private sweepboxId: number;

  constructor({ x = 120, y = 80 }: { x?: number; y?: number } = {}) {
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
    const sensor = new Actor({
      collider: Shape.Polygon(this.polygon),
      collisionGroup: CollisionGroup.Player,
    });
    this.addChild(sensor);
    this.sweepboxId = sensor.id;
  }

  get polygon(): Vector[] {
    //@ts-expect-error this.collider.get().points does exist since this uses a Box collider, which extends Polygon
    return this.collider.get().points;
  }

  // onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  //   if (side === Side.Bottom) {
  //     self.owner.get(BodyComponent).vel.y = 0;
  //   }
  //   if (side === Side.Left || side === Side.Right) {
  //     self.owner.get(BodyComponent).vel.x = 0;
  //   }
  // }
  onPreUpdate(engine: Engine, elapsed: number) {
    const sweptBox = this.children.find((e) => e.id === this.sweepboxId);
    const collider = sweptBox.get(ColliderComponent);
    const projection = this.vel.clone().scaleEqual((elapsed / 1000) * 2);
    collider.set(
      Shape.Polygon(minkowski(this.polygon, [vec(0, 0), projection])),
    );
  }
}

/**
 * sample usage:
 * 1. compute the 'projected' distance traveled. in this example I achieved this by using the velocity
 * and the update timestep to compute the pixel distance traveled.
 * 2. invoke the `minkowski` function with your 'square' hitbox and a 'polygon' represented by the velocity vector and the origin
 * 3. use the resulting Vector array to set your collider's geometry
 *
 * const projection = this.vel.clone().scaleEqual((elapsed / 1000) * 2);
 * collider.set(
 *       Shape.Polygon(minkowski(this.collider.get().points, [vec(0, 0), projection])),
 *     );
 */

export { PlayerActor };
