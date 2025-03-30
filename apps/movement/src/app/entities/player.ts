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
import { AnimFSM, State, States } from './player-anim-state';
import { generateFramesByName, isTupleOfAtLeast } from '../utils/frames';
import { ControllableComponent } from '../components/controllable';

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
  _state: State = States.stand;
  timeInState = 0;
  //which foot was last used to leap
  foot = 0;

  constructor({ x = 120, y = 80 }: { x?: number; y?: number } = {}) {
    super({
      x,
      y,
      width: 32,
      height: 32,
      // Let's give it some color with one of the predefined
      // color constants
      color: Color.Black,
      collisionType: CollisionType.Active,
      collisionGroup: CollisionGroup.Player,
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

    this.graphics.material = outlineMaterial;

    this.graphics.onPreDraw = () => {
      if (Math.abs(this.body.vel.x) > 0.5) {
        this.graphics.flipHorizontal = this.body.vel.x < 0;
      }
      /**
       * set the offset of the graphics back to nothing.
       * TODO this will eventually be per-frame to assist with animation
       */
      this.graphics.offset = vec(0, 0);

      const mobility = this.get(MobilityComponent);
      const touching = this.get(TouchingComponent);
      const nextState = AnimFSM[this._state](this.body, touching, {
        timeInState: this.timeInState,
      });

      switch (nextState) {
        case States.stand:
          if (
            (this._state === 'walk' || this._state === 'run') &&
            (touching[Side.Right] || touching[Side.Left])
          ) {
            console.log('bonked');
            this.graphics.use(bonk);
            break;
          }
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
          if (this._state !== 'jump') {
            this.foot = (this.foot + 1) % 2;
          }
          this.graphics.offset = vec(0, 6);
          leap.goToFrame(this.foot + 1);
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
          console.log('unhandled state:', nextState);
      }
      this.timeInState += 1;
      this.state = nextState;
    };
  }

  set state(nextState: State) {
    if (nextState !== this._state) this.timeInState = 0;
    this._state = nextState;
  }
}

/**
 * if (touching[Side.Bottom].size > 0) {
 *       //moving a minimum speed to start animation
 *       if (Math.abs(this.body.vel.x) > mobility.acc.x / 40) {
 *         if (this.graphics.current !== walk) {
 *           walk.goToFrame(2);
 *           this.graphics.use(walk);
 *         }
 *         const percentOfMax = Math.abs(this.body.vel.x) / mobility.max.x;
 *         //@ts-expect-error speed exists as long as the player always has an animation active
 *         this.graphics.current.speed = 0.5 + percentOfMax * 1.5;
 *       } else {
 *         //moving below minimum walk speed but accelerating
 *         if (Math.abs(this.body.acc.x) > 0) {
 *           //blocked by an obstacle in the direction of travel
 *           if (touching[this.body.acc.x < 0 ? Side.Left : Side.Right].size > 0) {
 *             if (this.bonked) this.graphics.use(stand);
 *             else {
 *               this.bonked = true;
 *               console.log('bonk');
 *             }
 *             //TODO bonk animation and then stand
 *             //not blocked, currently moving, but accelerating opposite the direction of travel
 *           } else if (
 *             Math.abs(this.body.vel.x) > 0.5 &&
 *             Math.sign(this.body.acc.x) === -1 * Math.sign(this.body.vel.x)
 *           ) {
 *             console.log('skrrt');
 *             //TODO screech/skid
 *           } else {
 *             this.bonked = false;
 *             console.log('zoom');
 *             walk.goToFrame(2);
 *             this.graphics.use(walk);
 *           }
 *           //slowed below min speed but not accelerating in any direction
 *         } else {
 *           this.bonked = false;
 *           this.graphics.use(stand);
 *         }
 *       }
 *     } else {
 *       this.graphics.use(tumble);
 *     }
 */

export { PlayerActor };
