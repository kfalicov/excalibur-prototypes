import {
  Component,
  Entity,
  InputHost,
  PointerEvent,
  Query,
  System,
  SystemPriority,
  SystemType,
  TransformComponent,
  Vector,
  World
} from 'excalibur';

class DraggableComponent extends Component {
  _draggable = true;
  grabbed = false;
  offset: Vector = new Vector(0, 0);
  constructor() {
    super();
  }

  onAdd(owner: Entity) {
    const transform = owner.get(TransformComponent);
    //@ts-expect-error "on" is weakly typed
    owner.on('pointerdown', (evt: PointerEvent) => {
      if (!this.draggable) return;
      this.grabbed = true;
      this.offset = new Vector(evt.worldPos.x - transform.globalPos.x,
        evt.worldPos.y - transform.globalPos.y);
    });
    //@ts-expect-error "on" is weakly typed
    owner.on('pointerup', (evt: PointerEvent) => {
      if (!this.draggable) return;
      this.grabbed = false;
    });
  }
  set draggable(val: boolean) {
    this._draggable = val;
    if (!val) {
      this.grabbed = false;
    }
  }
  get draggable() {
    return this._draggable;
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
      DraggableComponent,
    ]);
    this.input = input;
  }

  public update() {
    if (!this.input) return;
    const { x, y } = this.input.pointers.currentFramePointerCoords.get(0)?.worldPos ?? { x: 0, y: 0 };

    for (const entity of this.query.entities) {
      const drag = entity.get(DraggableComponent);
      const transform = entity.get(TransformComponent);
      if (!transform || !drag.grabbed) continue;
      transform.globalPos = new Vector(x - drag.offset.x, y - drag.offset.y);
    }
  }
}

export { DndSystem, DraggableComponent };

