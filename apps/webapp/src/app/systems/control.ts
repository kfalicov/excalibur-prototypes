import {
  BodyComponent,
  Component,
  Input,
  InputHost,
  Keys,
  MotionComponent,
  Query,
  System,
  SystemPriority,
  SystemType,
  TransformComponent,
  Vector,
  World,
} from 'excalibur';

class ControllableComponent extends Component {
  constructor() {
    super();
  }
}

class ControlSystem extends System {
  query: Query<typeof ControllableComponent>;
  input: InputHost;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;

  constructor(world: World, input: InputHost) {
    super();
    this.query = world.query([
      TransformComponent,
      MotionComponent,
      ControllableComponent,
    ]);
    this.input = input;
  }

  public update(delta) {
    if (!this.input) return;
    const up = this.input.keyboard.isHeld(Keys.W);
    const down = this.input.keyboard.isHeld(Keys.S);
    const left = this.input.keyboard.isHeld(Keys.A);
    const right = this.input.keyboard.isHeld(Keys.D);

    const x = (right ? 1 : 0) - (left ? 1 : 0);
    const y = (down ? 1 : 0) - (up ? 1 : 0);

    for (const entity of this.query.entities) {
      const body = entity.get(BodyComponent);
      body.acc = new Vector(x, y).clampMagnitude(1).scale(500);
      body.vel.scaleEqual(0.92);
    }
  }
}

export { ControlSystem, ControllableComponent };
