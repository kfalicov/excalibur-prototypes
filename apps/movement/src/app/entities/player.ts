import {
  Actor,
  Animation,
  AnimationStrategy,
  CollisionType,
  Color,
  Engine,
  range,
  Side,
} from 'excalibur';
import { MobilityComponent } from '../components/mobility';
import { TouchingComponent } from '../components/touching';
import { CollisionGroup } from '../utils/collision';
import { clownSheet } from '../resources/resources';

import clownViews from '../../assets/clown.json';

/**
 * dangerously trusts that the index within `clownViews` json is going to be the same
 * as the index used by the sprite sheet after Excalibur loads it
 */
const frameLookup = (query: string) =>
  clownViews.findIndex(({ name }) => name === query);

/**
 * generate a set of frame names that will be picked from the sprite sheet
 * to construct an animation
 */
const generateFramesByName = (
  startIndex: number,
  endIndex: number,
  prefix,
  padding?: number,
) => {
  return range(startIndex, endIndex)
    .map((i) => frameLookup(`${prefix}${`${i}`.padStart(padding, '0')}`))
    .filter((i) => i >= 0);
};

const stand = Animation.fromSpriteSheet(
  clownSheet,
  generateFramesByName(0, 6, 'stand_'),
  60,
  AnimationStrategy.PingPong,
);
stand.frames[0].duration = 240;
stand.frames[1].duration=120;
stand.frames[4].duration=120;
stand.frames[5].duration = 240;

const walk = Animation.fromSpriteSheet(
  clownSheet,
  generateFramesByName(0, 8, 'walk_'),
  80,
  AnimationStrategy.Loop,
);

const tumble = Animation.fromSpriteSheet(
  clownSheet,
  generateFramesByName(0, 8, 'tumble_'),
  40,
  AnimationStrategy.Loop,
);

class PlayerActor extends Actor {
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
  }
  onPreUpdate() {
    if (Math.abs(this.body.vel.x) > 0.5) {
      this.graphics.flipHorizontal = this.body.vel.x < 0;
    }
    //@ts-expect-error speed exists as long as the player always has an animation active
    this.graphics.current.speed=1;

    const mobility = this.get(MobilityComponent);
    const touching = this.get(TouchingComponent);
    if (touching[Side.Bottom].size>0) {
      if (Math.abs(this.body.vel.x) > mobility.acc.x / 60) {
        this.graphics.use(walk);
        const percentOfMax = Math.abs(this.body.vel.x) / mobility.max.x;
        //@ts-expect-error speed exists as long as the player always has an animation active
        this.graphics.current.speed = 0.5 + percentOfMax * 1.5;
      } else if(this.body.acc.x === 0){
        this.graphics.use(stand);
      }else {
        //use skid animation
      }
    }else{
      this.graphics.use(tumble);
    }
  }
}

export { PlayerActor };
