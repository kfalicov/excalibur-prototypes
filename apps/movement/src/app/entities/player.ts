import {
  Actor,
  Animation,
  AnimationStrategy,
  CollisionType,
  Color,
  Engine,
  Side,
  vec,
} from 'excalibur';
import { fragmentSource, vertexSource } from '@shader/outline';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';
import { CollisionGroup } from '../utils/collision';
import { clownSheet } from '../resources/resources';
import { PlayerAnimStateMachine, State, States } from './player-anim-state';
import { generateFramesByName, isTupleOfAtLeast } from '../utils/frames';
import { ControllableComponent } from '../components/controllable';
import { PieThrowAbility } from '../components/ability/pie';

const stand = new Animation({
  frames: generateFramesByName(clownSheet, 0, 5, 'stand_').map((i) => ({
    graphic: clownSheet.sprites[i],
    duration: 60,
  })),
  strategy: AnimationStrategy.PingPong,
});
if (isTupleOfAtLeast(stand.frames, 6)) {
  stand.frames[0].duration = 240;
  stand.frames[1].duration = 120;
  stand.frames[4].duration = 120;
  stand.frames[5].duration = 240;
}

const walk = new Animation({
  frames: generateFramesByName(clownSheet, 0, 7, 'walk_').map((i) => ({
    graphic: clownSheet.sprites[i],
    duration: 80,
  })),
  strategy: AnimationStrategy.Loop,
});

const run = new Animation({
  frames: generateFramesByName(clownSheet, 0, 5, 'run_').map((i) => ({
    graphic: clownSheet.sprites[i],
    duration: 80,
  })),
  strategy: AnimationStrategy.Loop,
});

const leap = new Animation({
  frames: generateFramesByName(clownSheet, 0, 7, 'leap_').map((i) => ({
    graphic: clownSheet.sprites[i],
    duration: 40,
  })),
  strategy: AnimationStrategy.Freeze,
});

const tumble = new Animation({
  frames: generateFramesByName(clownSheet, 0, 7, 'tumble_').map((i) => ({
    graphic: clownSheet.sprites[i],
    duration: 40,
  })),
  strategy: AnimationStrategy.Loop,
});

const bonk = clownSheet.sprites.find(
  ({ sourceView }) => sourceView.name === 'bonk_0',
);

class PlayerActor extends Actor {
  constructor({ x = 120, y = 80 }: { x?: number; y?: number } = {}) {
    super({
      x,
      y,
      width: 16,
      height: 20,
      // Let's give it some color with one of the predefined
      // color constants
      color: Color.Black,
      collisionType: CollisionType.Active,
      collisionGroup: CollisionGroup.Player,
      anchor: vec(0.5, 1),
    });
    this.graphics.use(stand);
  }

  onInitialize(engine: Engine): void {
    this.body.friction = 0.9;
    this.body.useGravity = true;
    const playerMobility = new MobilityComponent();
    this.addComponent(playerMobility);
    this.addComponent(new TouchingComponent());

    const ability = new PieThrowAbility();
    this.addComponent(ability);
    this.addComponent(new ControllableComponent());

    const outlineMaterial = engine.graphicsContext.createMaterial({
      name: 'outline',
      fragmentSource,
      vertexSource,
    });

    // Set the outline radius uniform
    outlineMaterial.update((shader) =>
      shader.trySetUniformInt('u_outline_radius', 2),
    );

    this.graphics.material = outlineMaterial;

    this.graphics.onPreDraw = () => {
      /**
       * set the offset of the graphics back to nothing.
       * TODO this will eventually be per-frame to assist with animation
       */
      this.graphics.offset = vec(0, 0);
      /**
       * defer rendering to the ability component. Don't use default state
       * management to render the character
       */
      if (ability.locks.graphics) {
        return;
      }
      if (Math.abs(this.body.vel.x) > 0.5) {
        this.graphics.flipHorizontal = this.body.vel.x < 0;
      }

      const mobility = this.get(MobilityComponent);

      switch (PlayerAnimStateMachine.currentState.name) {
        case States.wallsplat:
          if (bonk) this.graphics.use(bonk);
          break;
        case States.stand:
          stand.play();
          this.graphics.use(stand);
          break;
        case States.walk:
          {
            const percentOfMax = Math.abs(this.body.vel.x) / mobility.max.x;
            walk.speed = 0.5 + percentOfMax * 1.5;
            this.graphics.use(walk);
          }
          break;
        case States.prejump:
          leap.goToFrame(0);
          this.graphics.use(leap);
          this.graphics.offset = vec(0, 5);
          break;
        case States.jump:
          this.graphics.offset = vec(0, 6);
          leap.goToFrame(PlayerAnimStateMachine.data.foot + 1);
          this.graphics.use(leap);
          break;
        case States.ceilingsplat:
          leap.goToFrame(4);
          this.graphics.use(leap);
          break;
        case States.rise:
        case States.apex:
          leap.goToFrame(3);
          this.graphics.use(leap);
          break;
        case States.fall:
          leap.goToFrame(5);
          this.graphics.use(leap);
          break;
        case States.plummet:
          leap.goToFrame(6);
          this.graphics.use(leap);
          break;
        default:
          console.log(
            'unhandled state:',
            PlayerAnimStateMachine.currentState.name,
          );
      }
    };
  }

  set state(nextState: State) {
    const success = PlayerAnimStateMachine.go(nextState);
    // console.log('went to', nextState, success);
  }

  onPostUpdate(engine: Engine, elapsed: number) {
    PlayerAnimStateMachine.update(elapsed);
    const touching = this.get(TouchingComponent);
    // console.log(
    //   touching[Side.Left].size,
    //   touching[Side.Right].size,
    //   touching[Side.Top].size,
    //   touching[Side.Bottom].size,
    // );
    /**
     * check this before the velocity check
     */
    if (touching[Side.Right].size || touching[Side.Left].size) {
      PlayerAnimStateMachine.go(States.wallsplat);
    }
    if (touching[Side.Top].size) {
      PlayerAnimStateMachine.go(States.ceilingsplat);
    }
    if (this.body.vel.y > 0) PlayerAnimStateMachine.go(States.apex);
    if (this.body.vel.y > 10) PlayerAnimStateMachine.go(States.fall);
    if (Math.abs(this.body.vel.x) > 10 && touching[Side.Bottom].size)
      PlayerAnimStateMachine.go(States.walk);
    else if (touching[Side.Bottom].size) {
      PlayerAnimStateMachine.go(States.stand);
    }
    PlayerAnimStateMachine.data.timeInCurrentState++;
  }
}

export { PlayerActor };
