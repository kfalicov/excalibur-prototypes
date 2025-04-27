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
import { TouchingComponent } from '../../components/touching';
import { CollisionGroup } from '../../utils/collision';
import { strongmanSheet } from '../../resources/resources';
import { generateFramesByName, isTupleOfAtLeast } from '../../utils/frames';
import { MobilityComponent } from '../../components/mobility';
import { Projectile } from '../../utils/projectile-factory';
import { States, StrongmanAnimStateMachine } from './strongman-anim-state';
import { State } from '../clown/player-anim-state';

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
  timeInState = 0;
  name = 'strongman';
  health = 5;

  constructor({ x = 80, y = 100 }: { x?: number; y?: number } = {}) {
    super({
      x,
      y,
      width: 32,
      height: 32,
      // Let's give it some color with one of the predefined
      // color constants
      color: Color.Black,
      collisionType: CollisionType.Active,
      collisionGroup: CollisionGroup.NonPlayer,
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

    // Set the outline radius uniform
    outlineMaterial.update((shader) =>
      shader.trySetUniformInt('u_outline_radius', 2),
    );

    this.graphics.material = outlineMaterial;
    this.body.group = CollisionGroup.NonPlayer;
    this.on('collisionstart', (e) => {
      if (e.other.owner instanceof Projectile) {
        this.health--;
        if (this.health === 0) {
          this.rotation = Math.PI / 2;
        }
      }
    });
    this.graphics.onPreDraw = () => {
      if (Math.abs(this.body.vel.x) > 0.5) {
        this.graphics.flipHorizontal = this.body.vel.x > 0;
      }
      switch (StrongmanAnimStateMachine.currentState.name) {
        case States.stand:
          stand.play();
          this.graphics.use(stand);
          break;
        case States.walk:
          walk.play();
          this.graphics.use(walk);
          break;
        default:
          console.log(
            'unhandled state:',
            StrongmanAnimStateMachine.currentState.name,
          );
      }
    };
  }

  set state(nextState: State) {
    const success = StrongmanAnimStateMachine.go(nextState);
    // console.log('went to', nextState, success);
  }

  onPostUpdate(engine: Engine, elapsed: number) {
    const prevState = StrongmanAnimStateMachine.currentState.name;
    StrongmanAnimStateMachine.update(elapsed);
    StrongmanAnimStateMachine.data.timeInCurrentState++;
    const touching = this.get(TouchingComponent);

    /**
     * check any wall/floor collisions before the plain velocity checks
     */

    if (this.body.vel.y > 0) StrongmanAnimStateMachine.go(States.apex);
    if (this.body.vel.y > 10) StrongmanAnimStateMachine.go(States.fall);

    if (Math.abs(this.body.vel.x) > 10 && touching[Side.Bottom].size) {
      if (prevState !== States.walk) {
        walk.goToFrame(2);
      }
      StrongmanAnimStateMachine.go(States.walk);
    } else if (touching[Side.Bottom].size) {
      StrongmanAnimStateMachine.go(States.stand);
    }
  }
}

export { StrongmanActor };
