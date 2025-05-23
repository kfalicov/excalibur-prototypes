import {
  Axes,
  BodyComponent,
  Buttons,
  InputHost,
  Keys,
  Query,
  Scene,
  System,
  SystemPriority,
  SystemType,
  vec,
  World,
} from 'excalibur';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';
import { ControllableComponent } from '../components/controllable';

type Intent = {
  Left: boolean;
  Right: boolean;
  Up: boolean;
  Down: boolean;
};

class ControlSystem extends System {
  query: Query<
    | typeof BodyComponent
    | typeof MobilityComponent
    | typeof ControllableComponent
  >;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;

  controls = {
    Left: [Keys.A, Buttons.DpadLeft, Axes.LeftStickX],
    Right: [Keys.D, Buttons.DpadRight, Axes.LeftStickX],
    Up: [Keys.W, Buttons.DpadUp, Axes.LeftStickY],
    Down: [Keys.S, Buttons.DpadDown, Axes.LeftStickY],
    Jump: [Keys.Space, Buttons.Face1],
    Attack: [Keys.B, Buttons.Face3],
    Sprint: [Keys.ShiftLeft],
  } as const;

  constructor(
    world: World,
    private input: InputHost,
    private scene: Scene,
  ) {
    super();
    this.query = world.query([
      BodyComponent,
      MobilityComponent,
      ControllableComponent,
    ]);
  }

  previousIntent = {
    Left: false,
    Right: false,
    Up: false,
    Down: false,
    Jump: false,
    Attack: false,
  };

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
      Sprint: this.isHeld('Sprint'),
    };

    for (const entity of this.query.entities) {
      const controllable = entity.get(ControllableComponent);
      const mobility = entity.get(MobilityComponent);
      const body = entity.get(BodyComponent);

      if (!controllable.enabled) {
        body.acc = vec(0, mobility.gravity);
        body.vel.x *= mobility.damp.x;
        continue;
      }
      const touching = entity.get(TouchingComponent);
      const grounded = (touching?.Bottom.size ?? 0) > 0;

      if (grounded) {
        mobility.midairJumpsUsed = 0;
      }
      if (intent.Sprint) {
        mobility.sprinting = true;
        entity.state = 'run';
        /**
         * automatically stop sprinting once no directions are held. The resulting effect
         * should be like a 'one-tap toggle' to enable sprinting, but it won't stop until you stop moving
         * or deliberately end the effect with another tap
         */
      } else if (!intent.Right && !intent.Left) {
        mobility.sprinting = false;
      }
      if (intent.Jump && !this.previousIntent.Jump) {
        if (grounded) {
          entity.state = 'prejump';
        } else if (mobility.midairJumpsUsed < mobility.maxMidairJumps) {
          entity.state = 'jump';
        }
        mobility.jump();
      }

      mobility.compute(intent);
      mobility.aiming = false;
    }

    this.previousIntent = intent;
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
