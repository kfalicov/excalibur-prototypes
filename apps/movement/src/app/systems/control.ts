import {
  Axes,
  BodyComponent,
  Buttons,
  clamp,
  InputHost,
  Keys,
  Query,
  System,
  SystemPriority,
  SystemType,
  Vector,
  World,
} from 'excalibur';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';

class ControlSystem extends System {
  query: Query<typeof BodyComponent | typeof MobilityComponent>;
  input: InputHost;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;

  controls = {
    Left: [Keys.A, Buttons.DpadLeft, Axes.LeftStickX],
    Right: [Keys.D, Buttons.DpadRight, Axes.LeftStickX],
    Up: [Keys.W, Buttons.DpadUp, Axes.LeftStickY],
    Down: [Keys.S, Buttons.DpadDown, Axes.LeftStickY],
    Jump: [Keys.Space, Buttons.Face1],
    Attack: [Keys.E, Buttons.Face3],
  } as const;

  constructor(world: World, input: InputHost) {
    super();
    this.query = world.query([BodyComponent, MobilityComponent]);
    this.input = input;
  }

  public update(elapsedMs: number) {
    if (!this.input) return;
    /**
     * get user controls intent
     */
    const intent = {
      Left: this.isHeld('Left'),
      Right: this.isHeld('Right'),
      Up: this.isHeld('Up'),
      Down: this.isHeld('Down'),
      Jump: this.isHeld('Jump'),
      Attack: this.isHeld('Attack'),
    };

    for (const entity of this.query.entities) {
      const mobility = entity.get(MobilityComponent);
      const body = entity.get(BodyComponent);
      const touching = entity.get(TouchingComponent);
      const grounded = (touching?.Bottom.size ?? 0) > 0;

      const acc = this.computeAcceleration(mobility, intent);
      acc.y = mobility.gravity;
      // grounded ? (acc.y = 0) : (acc.y = mobility.gravity);

      body.acc = acc;
      let x = body.vel.x;
      let y = body.vel.y;
      if (grounded) {
        if (intent.Jump) {
          // x *= 2;
          y = -mobility.jump;
        }
        x *= mobility.damp.x;
      }
      x = clamp(x, -mobility.max.x, mobility.max.x);
      body.vel = new Vector(x, y);
    }
  }

  /**
   * compute movement that should be applied to the body
   * based on the user's intent and the mobility properties
   */
  private computeAcceleration(
    mobility: MobilityComponent,
    intent: Record<keyof typeof this.controls, boolean>,
  ) {
    //the horizontal intent
    const x = (intent.Right ? 1 : 0) - (intent.Left ? 1 : 0);
    //the vertical intent
    const y = (intent.Down ? 1 : 0) - (intent.Up ? 1 : 0);
    const acc = new Vector(x * mobility.acc.x, y * mobility.acc.y);

    return acc;
  }

  isHeld(control: keyof typeof this.controls) {
    const [key, button, axis] = this.controls[control];

    const gamePadIfAny = this.getGamepad();

    return Boolean(
      this.input.keyboard.isHeld(key) ||
        gamePadIfAny?.isButtonHeld(button) ||
        (axis !== undefined &&
          Math.sign(gamePadIfAny?.getAxes(axis) ?? 0) === axisMapping[control]),
    );
  }

  getGamepad() {
    return [
      this.input.gamepads.at(0),
      this.input.gamepads.at(1),
      this.input.gamepads.at(2),
      this.input.gamepads.at(3),
    ].find((g) => g.connected);
  }
}

const axisMapping: Partial<
  Record<'Left' | 'Right' | 'Up' | 'Down' | 'Jump' | 'Attack', number>
> = {
  Left: -1,
  Right: 1,
  Up: -1,
  Down: 1,
};

export { ControlSystem };
