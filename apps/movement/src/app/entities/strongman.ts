import {
  Actor,
  Animation,
  AnimationStrategy,
  CollisionType,
  Color,
  Engine,
  vec,
} from 'excalibur';
import { fragmentSource, vertexSource } from '@shader/outline';
import { TouchingComponent } from '../components/touching';
import { CollisionGroup } from '../utils/collision';
import { strongmanSheet } from '../resources/resources';
import { State, States } from './player-anim-state';
import { generateFramesByName, isTupleOfAtLeast } from '../utils/frames';
import { MobilityComponent } from '../components/mobility';

const stand = new Animation({
  frames: generateFramesByName(strongmanSheet, 0, 7, 'idle_').map((i) => ({
    duration: 120,
    graphic: strongmanSheet.sprites[i],
  })),
  strategy: AnimationStrategy.Loop,
});
if (isTupleOfAtLeast(stand.frames, 5)) {
  stand.frames[0].duration = 240;
  stand.frames[4].duration = 240;
}

const walk = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: generateFramesByName(strongmanSheet, 0, 7, 'walk_').map((i) => ({
    duration: 120,
    graphic: strongmanSheet.sprites[i],
  })),
});
// if (isTupleOfAtLeast(walk.frames, 5)) {
//   walk.frames[0].duration = 240;
//   walk.frames[4].duration = 240;
// }

class StrongmanActor extends Actor {
  state: State = States.stand;
  timeInState = 0;

  constructor({ x = 120, y = 120 }: { x?: number; y?: number } = {}) {
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
    this.graphics.offset = vec(0, -16);
    const strongmanMobility = new MobilityComponent();
    strongmanMobility.acc = vec(100, 100);
    strongmanMobility.max = vec(40, 40);
    strongmanMobility.maxMidairJumps = 0;
    this.addComponent(strongmanMobility);
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
      this.graphics.flipHorizontal = this.body.vel.x > 0;
    }
    //@ts-expect-error speed exists as long as the player always has an animation active
    this.graphics.current.speed = 1;

    const touching = this.get(TouchingComponent);
    const nextState =
      Math.abs(this.body.vel.x) > 10 ? States.walk : States.stand;

    if (nextState !== this.state) this.timeInState = 0;
    else this.timeInState += 1;

    switch (nextState) {
      case States.stand:
        stand.play();
        this.graphics.use(stand);
        break;
      case States.walk:
        if (this.state !== States.walk) {
          walk.goToFrame(2);
        }
        walk.play();
        this.graphics.use(walk);
        break;
      default:
        console.log('unhandled state:', nextState);
    }
    this.state = nextState;
  }
}

export { StrongmanActor };
