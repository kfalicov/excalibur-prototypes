import {
  Actor,
  Animation,
  AnimationStrategy,
  CollisionType,
  Color,
  Engine,
} from 'excalibur';
import { fragmentSource, vertexSource } from '@shader/outline';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';
import { CollisionGroup } from '../utils/collision';
import { clownSheet } from '../resources/resources';

import clownViews from '../../assets/clown.json';
import { AnimFSM, State, States } from './player-anim-state';
import { generateFramesByName, isTupleOfAtLeast } from '../utils/frames';

const stand = Animation.fromSpriteSheet(
  clownSheet,
  generateFramesByName(clownViews, 0, 5, 'stand_'),
  60,
  AnimationStrategy.PingPong,
);
if (isTupleOfAtLeast(stand.frames, 6)) {
  stand.frames[0].duration = 240;
  stand.frames[1].duration = 120;
  stand.frames[4].duration = 120;
  stand.frames[5].duration = 240;
}

const walk = Animation.fromSpriteSheet(
  clownSheet,
  generateFramesByName(clownViews, 0, 7, 'walk_'),
  80,
  AnimationStrategy.Loop,
);

const tumble = Animation.fromSpriteSheet(
  clownSheet,
  generateFramesByName(clownViews, 0, 7, 'tumble_'),
  40,
  AnimationStrategy.Loop,
);

class PlayerActor extends Actor {
  state: State = States.stand;
  timeInState = 0;

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
    this.addComponent(new MobilityComponent());
    this.addComponent(new TouchingComponent());

    const outlineMaterial = engine.graphicsContext.createMaterial({
      name: 'outline',
      fragmentSource,
      vertexSource,
    });

    this.graphics.material = outlineMaterial;
  }

  onPreUpdate() {
    if (Math.abs(this.body.vel.x) > 0.5) {
      this.graphics.flipHorizontal = this.body.vel.x < 0;
    }
    //@ts-expect-error speed exists as long as the player always has an animation active
    this.graphics.current.speed = 1;

    const mobility = this.get(MobilityComponent);
    const touching = this.get(TouchingComponent);
    const nextState = AnimFSM[this.state](this.body, touching, {
      timeInState: this.timeInState,
    });

    if (nextState !== this.state) this.timeInState = 0;
    else this.timeInState += 1;

    switch (nextState) {
      case States.stand:
        stand.play();
        this.graphics.use(stand);
        break;
      case States.walk:
        const percentOfMax = Math.abs(this.body.vel.x) / mobility.max.x;
        walk.speed = 0.5 + percentOfMax * 1.5;
        this.graphics.use(walk);
        break;
      case States.jump:
        stand.pause();
        this.graphics.use(stand);
        break;
      case States.rise:
        tumble.pause();
        tumble.goToFrame(1);
        this.graphics.use(tumble);
        break;
      case States.apex:
        tumble.pause();
        tumble.goToFrame(0);
        this.graphics.use(tumble);
        break;
      case States.fall:
        tumble.pause();
        tumble.goToFrame(7);
        this.graphics.use(tumble);
        break;
      default:
        console.log('unhandled state:', nextState);
    }
    this.state = nextState;
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
