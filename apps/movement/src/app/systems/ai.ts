import {
  BodyComponent,
  clamp,
  Query,
  Scene,
  System,
  SystemPriority,
  SystemType,
  Vector,
  World,
} from 'excalibur';
import { AIBehavior } from '../components/ai-behavior';
import { ControllableComponent } from '../components/controllable';
import { MobilityComponent } from '../components/mobility';

class AISystem extends System {
  targetsQuery: Query<typeof ControllableComponent>;
  query: Query<typeof AIBehavior>;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Average;

  constructor(world: World) {
    super();
    this.query = world.query([AIBehavior]);
    this.targetsQuery = world.query([ControllableComponent]);
  }

  public initialize(world: World, scene: Scene) {}

  public update(elapsedMs: number) {
    for (const entity of this.query.entities) {
      const behavior = entity.get(AIBehavior);
      const mobility = entity.get(MobilityComponent);
      const body = entity.get(BodyComponent);

      behavior.timeInState += 1;
      if (behavior.timeInState > behavior.frequency) {
        const targets = this.targetsQuery.entities.filter(
          (e) => e.get(ControllableComponent).enabled,
        );
        behavior.tree.blackboard.targets = targets;
        behavior.timeInState = 0;
        behavior.tree.step();
      }

      const acc = computeAcceleration(
        mobility,
        behavior.tree.blackboard.intent ?? {},
      );
      acc.y = mobility.gravity;
      // grounded ? (acc.y = 0) : (acc.y = mobility.gravity);

      body.acc = acc;
      let x = body.vel.x;
      let y = body.vel.y;
      x = clamp(x, -mobility.max.x, mobility.max.x);
      body.vel = new Vector(x, y);
    }
  }
}

/**
 * compute movement that should be applied to the body
 * based on the user's intent and the mobility properties
 */
function computeAcceleration(
  mobility: MobilityComponent,
  intent: Record<'Left' | 'Right', boolean>,
) {
  //the horizontal intent
  const x = (intent.Right ? 1 : 0) - (intent.Left ? 1 : 0);
  //the vertical intent
  // const y = (intent.Down ? 1 : 0) - (intent.Up ? 1 : 0);
  const acc = new Vector(x * mobility.acc.x, 0);

  return acc;
}

export { AISystem };
