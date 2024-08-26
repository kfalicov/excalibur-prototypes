import {
  BodyComponent,
  Component,
  InputHost,
  Keys,
  MotionComponent,
  Query,
  System,
  SystemPriority,
  SystemType,
  TransformComponent,
  Vector,
  World
} from 'excalibur';

class DraggableComponent extends Component {
  constructor() {
    super();
  }
}

class DndSystem extends System {
  query: Query<typeof DraggableComponent>;
  input: InputHost;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;

  constructor(world: World, input: InputHost) {
    super();
    this.query = world.query([
      TransformComponent,
      MotionComponent,
      DraggableComponent,
    ]);
    this.input = input;
  }

  public update(delta: number) {
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

export { DndSystem, DraggableComponent };

