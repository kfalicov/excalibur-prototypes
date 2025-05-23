import {
  Actor,
  Animation,
  AnimationStrategy,
  clamp,
  CollisionType,
  Color,
  Engine,
  Ray,
  Side,
  vec,
  Vector,
} from 'excalibur';
import { fragmentSource, vertexSource } from '@shader/outline';
import { MobilityComponent } from '../../components/mobility';
import { TouchingComponent } from '../../components/touching';
import { CollisionGroup } from '../../utils/collision';
import { arthurSheet } from '../../resources/resources';
import { PlayerAnimStateMachine, State, States } from './player-anim-state';
import { generateFramesByName } from '../../utils/frames';
import { ControllableComponent } from '../../components/controllable';

const stand = arthurSheet.sprites.find(
  ({ sourceView }) => sourceView.name === 'stand_0',
);

const walk = new Animation({
  frames: generateFramesByName(arthurSheet, 0, 7, 'walk_').map((i) => ({
    graphic: arthurSheet.sprites[i],
    duration: 80,
  })),
  strategy: AnimationStrategy.Loop,
});

const run = new Animation({
  frames: generateFramesByName(arthurSheet, 0, 5, 'run_').map((i) => ({
    graphic: arthurSheet.sprites[i],
    duration: 60,
  })),
  strategy: AnimationStrategy.Loop,
});

const leap = new Animation({
  frames: generateFramesByName(arthurSheet, 0, 1, 'jump_').map((i) => ({
    graphic: arthurSheet.sprites[i],
    duration: 40,
  })),
  strategy: AnimationStrategy.Freeze,
});

const fall = new Animation({
  frames: generateFramesByName(arthurSheet, 0, 1, 'fall_').map((i) => ({
    graphic: arthurSheet.sprites[i],
    duration: 40,
  })),
  strategy: AnimationStrategy.Loop,
});

const atk_gnd_1 = new Animation({
  frames: generateFramesByName(arthurSheet, 1, 2, 'atk_gnd_').map((i) => ({
    graphic: arthurSheet.sprites[i],
    duration: 40,
  })),
  strategy: AnimationStrategy.Loop,
});

const atk_gnd_2 = new Animation({
  frames: generateFramesByName(arthurSheet, 3, 4, 'atk_gnd_').map((i) => ({
    graphic: arthurSheet.sprites[i],
    duration: 40,
  })),
  strategy: AnimationStrategy.Loop,
});

const atk_lunge = new Animation({
  frames: generateFramesByName(arthurSheet, 5, 6, 'atk_gnd_').map((i) => ({
    graphic: arthurSheet.sprites[i],
    duration: 40,
  })),
  strategy: AnimationStrategy.Loop,
});

const bonk = arthurSheet.sprites.find(
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
       * when attempting to draw the graphics, we can raycast to the ground.
       * This is useful for several animations such as the first few frames of the 'jump'
       * where even when the character has some upwards velocity we want the jump animation to be
       * anchored to the ground.
       */
      const bounds = this.collider.bounds;
      const leftRay = new Ray(bounds.bottomLeft, Vector.Down);
      const centerRay = new Ray(
        bounds.center.add(vec(0, bounds.height / 2)),
        Vector.Down,
      );
      const rightRay = new Ray(bounds.bottomRight, Vector.Down);

      const leftHits =
        this.scene?.physics.rayCast(leftRay, {
          maxDistance: 16,
          searchAllColliders: false,
          // collisionGroup:CollisionGroup.Ground,
          collisionMask: CollisionGroup.Player.mask,
        }) ?? [];
      const centerHits =
        this.scene?.physics.rayCast(centerRay, {
          maxDistance: 16,
          searchAllColliders: false,
          collisionMask: CollisionGroup.Player.mask,
        }) ?? [];
      const rightHits =
        this.scene?.physics.rayCast(rightRay, {
          maxDistance: 16,
          searchAllColliders: false,
          collisionMask: CollisionGroup.Player.mask,
        }) ?? [];
      const minDistanceToGround = Math.min(
        leftHits[0]?.distance ?? Infinity,
        centerHits[0]?.distance ?? Infinity,
        rightHits[0]?.distance ?? Infinity,
      );

      /**
       * set the offset of the graphics back to nothing.
       * TODO this will eventually be per-frame to assist with animation
       */
      this.graphics.offset = vec(0, 0);

      if (Math.abs(this.body.vel.x) > 0.5) {
        this.graphics.flipHorizontal = this.body.vel.x < 0;
      }

      const mobility = this.get(MobilityComponent);

      switch (PlayerAnimStateMachine.currentState.name) {
        case States.wallsplat:
          if (bonk) this.graphics.use(bonk);
          break;
        case States.stand:
          this.graphics.use(stand);
          break;
        case States.run:
          this.graphics.use(run);
          break;
        case States.walk:
          {
            const percentOfMax = Math.abs(this.body.vel.x) / mobility.max.x;
            walk.speed = 0.25 + percentOfMax;
            this.graphics.use(walk);
          }
          break;
        case States.prejump:
          {
            leap.goToFrame(0);
            this.graphics.use(leap);
            const dtg =
              minDistanceToGround === Infinity ? 0 : minDistanceToGround;
            this.graphics.offset = vec(0, dtg);
          }
          break;
        case States.jump:
          this.graphics.offset = vec(
            0,
            clamp(9 - PlayerAnimStateMachine.data.timeInCurrentState, 0, 6),
          );
          leap.goToFrame(1);
          this.graphics.use(leap);
          break;
        case States.rise:
        case States.apex:
          fall.pause();
          fall.goToFrame(0);
          this.graphics.use(fall);
          break;
        case States.fall:
          fall.play();
          this.graphics.use(fall);
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
    const mobility = this.get(MobilityComponent);
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
    if (mobility.sprinting && touching[Side.Bottom].size) {
      PlayerAnimStateMachine.go(States.run);
    } else if (Math.abs(this.body.vel.x) > 10 && touching[Side.Bottom].size)
      PlayerAnimStateMachine.go(States.walk);
    else if (touching[Side.Bottom].size) {
      PlayerAnimStateMachine.go(States.stand);
    }
    PlayerAnimStateMachine.data.timeInCurrentState++;
  }
}

export { PlayerActor };
