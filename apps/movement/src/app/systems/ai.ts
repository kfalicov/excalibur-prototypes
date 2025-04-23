import {
  Query, Scene,
  System,
  SystemPriority,
  SystemType, vec,
  World
} from 'excalibur';
import { AIBehavior } from '../components/ai-behavior';
import { MobilityComponent } from '../components/mobility';

class AISystem extends System {
  query: Query<typeof AIBehavior>;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Average;

  constructor(world: World) {
    super();
    this.query = world.query([AIBehavior]);
  }

  public initialize(world: World, scene: Scene) {

  }

  public update(elapsedMs: number) {
    for (const entity of this.query.entities) {
      const behavior = entity.get(AIBehavior);
      const mobility = entity.get(MobilityComponent);
      behavior.timeInState+=elapsedMs;
      if (behavior.timeInState >=5000) {
        behavior.timeInState=0;
      }
      if(behavior.timeInState===0 && mobility){
        entity.actions.moveTo(vec(100,-50),mobility.max.x)
      }
    }
  }
}

export { AISystem };
