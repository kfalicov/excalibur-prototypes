import {
  Actor,
  Animation,
  AnimationStrategy,
  CollisionType,
  Color,
  Engine,
  Sprite,
  vec,
} from 'excalibur';
import { CollisionGroup } from '../utils/collision';
import { dogSheet, Resources } from '../resources/resources';
import dogViews from '../../assets/dog.json';
import { generateFramesByName } from '../utils/frames';
import { fragmentSource, vertexSource } from '@shader/outline';

const run = new Animation({
  frames: generateFramesByName(dogSheet, 0, 7, 'run_').map((i) => ({
    graphic: dogSheet.sprites[i],
    duration: 60,
  })),
  strategy: AnimationStrategy.Loop,
});

const play = new Animation({
  frames: generateFramesByName(dogSheet, 0, 3, 'play_').map((i) => ({
    graphic: dogSheet.sprites[i],
    duration: 60,
  })),
  strategy: AnimationStrategy.Freeze,
});

const tail = new Animation({
  frames: generateFramesByName(dogSheet, 0, 3, 'tail_').map((i) => ({
    graphic: dogSheet.sprites[i],
    duration: 60,
  })),
  strategy: AnimationStrategy.Loop,
});
const tailOffset = vec(-3, 5);

const stand = new Sprite({
  sourceView: dogViews.find(({ name }) => name === 'stand'),
  image: Resources.dog,
});

class DogActor extends Actor {
  state = 'stand';
  timeInState = 0;
  tailActor: Actor;

  constructor({ x = 70, y = 80 }: { x?: number; y?: number } = {}) {
    super({
      x,
      y,
      width: 16,
      height: 16,
      // Let's give it some color with one of the predefined
      // color constants
      color: Color.Black,
      collisionType: CollisionType.Active,
      collisionGroup: CollisionGroup.NonPlayer,
    });
    this.graphics.use(stand);
    const tailActor = new Actor({
      pos: tailOffset,
    });
    tailActor.z = -1;
    tailActor.graphics.use(tail);
    this.tailActor = tailActor;
    this.addChild(tailActor);
  }

  onInitialize(engine: Engine): void {
    this.body.friction = 0.5;
    this.body.useGravity = true;
    this.body.acc.y = 450;
    this.body.bounciness = 0.5;

    const outlineMaterial = engine.graphicsContext.createMaterial({
      name: 'outline',
      fragmentSource,
      vertexSource,
    });

    this.graphics.material = outlineMaterial;
  }

  onPreUpdate() {
    if (Math.abs(this.body.vel.x) > 0.5) {
      this.tailActor.graphics.flipHorizontal = this.graphics.flipHorizontal =
        this.body.vel.x < 0;

      this.tailActor.pos = vec(
        Math.sign(this.body.vel.x) * tailOffset.x,
        tailOffset.y,
      );
    }

    //@ts-expect-error speed exists as long as the player always has an animation active
    this.graphics.current.speed = 1;

    if (Math.abs(this.body.vel.x) > 10) {
      const percentOfMax = Math.abs(this.body.vel.x) / 30;
      run.speed = 0.5 + percentOfMax * 1.5;
      this.graphics.use(run);
      this.tailActor.graphics.hide();
    } else {
      this.graphics.use(stand);
      this.tailActor.graphics.use(tail);
    }
  }
}

export { DogActor };
