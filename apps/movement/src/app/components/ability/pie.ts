import { Actor, BodyComponent, Component, vec } from 'excalibur';
import { Resources } from '../../resources/resources';
import { PieAnimStateMachine } from './pie-anim-state';

type Intent = {
  Left: boolean;
  Right: boolean;
  Up: boolean;
  Down: boolean;
  Attack: boolean;
};

/**
 * a component of an entity that represents states and scripts for throwing a pie
 */
class PieThrowAbility extends Component {
  /**
   * claim locks on the graphics and physics components of the entity
   * such that they may not be modified by other components.
   * Make sure to release them when not needed!
   */
  locks = {
    graphics: false,
    physics: false,
  };
  aiming: boolean = false;
  previousIntent: Intent = {
    Left: false,
    Right: false,
    Up: false,
    Down: false,
    Jump: false,
    Attack: false,
  };
  heldPie: Actor | null = null;
  charge = 0;

  constructor() {
    super();
  }

  onAdd(owner: Actor) {
    super.onAdd?.(owner);
  }

  compute(intent: Intent) {
    const entity = this.owner;
    if (!entity || !entity.has(BodyComponent)) return;
    const body = entity.get(BodyComponent);
    this.locks.physics = false;
    if (intent.Attack) {
      this.locks.graphics = true;
      this.locks.physics = true;
      if (intent.Left || intent.Right) {
        entity.graphics.flipHorizontal = intent.Left;
      }
      PieAnimStateMachine.go('windup');
      this.charge++;
      if (!this.previousIntent.Attack) {
        this.charge = 0;
        this.heldPie = new Actor({ pos: vec(0, 0), name: 'pie' });
        this.heldPie.offset = entity.graphics.flipHorizontal
          ? vec(8, -20)
          : vec(-8, -20);
        // heldPie.graphics.anchor = vec(0.3, 0.5);
        this.heldPie.actions.repeatForever((repeatCtx) => {
          repeatCtx.callMethod(() => {
            this.heldPie.graphics.flipHorizontal =
              entity.graphics.flipHorizontal;
            this.heldPie.offset = entity.graphics.flipHorizontal
              ? vec(8, -20)
              : vec(-8, -20);
          });
          repeatCtx.moveTo(
            vec(Math.random() * 1 - 1, Math.random() * 1 - 1),
            50,
          );
        });
        this.heldPie.graphics.use(Resources.pie_sm.toSprite());
        entity.addChild(this.heldPie);
      }
    } else if (this.previousIntent.Attack) {
      PieAnimStateMachine.go('toss');
      entity.removeChild(this.heldPie);
      const vel = computeThrow(intent, entity.graphics.flipHorizontal);
      this.owner.scene?.projectileFactory.spawn(
        body.center.x,
        body.center.y - 10,
        vel.x,
        vel.y,
        this.charge > 120 ? 2 : this.charge > 60 ? 1 : 0,
        !entity.graphics.flipHorizontal,
      );
    }
    PieAnimStateMachine.go('external');
    PieAnimStateMachine.update(1);
    PieAnimStateMachine.data.timeInCurrentState++;

    if (this.charge > 60) {
      this.heldPie?.graphics.use(Resources.pie_md.toSprite());
    }
    if (this.charge > 120) {
      this.heldPie?.graphics.use(Resources.pie_lg.toSprite());
    }

    this.previousIntent = intent;

    if (this.locks.graphics) {
      switch (PieAnimStateMachine.currentState.name) {
        case 'windup':
          entity.graphics.use(Resources.windup.toSprite());
          break;
        case 'toss':
          entity.graphics.use(Resources.toss.toSprite());
          break;
        default:
          this.locks.graphics = false;
      }
    }
  }
}

const computeThrow = (intent: Intent, flip: boolean) => {
  if (intent.Right || intent.Left) {
    return vec(flip ? -280 : 280, -150);
    // use low angle
  } else if (intent.Up) {
    return vec(flip ? -30 : 30, -400);
    //use vertical
  } else if (intent.Down) {
    //use diagonal down
    return vec(flip ? -210 : 210, 70);
  } else {
    //default direction based on flip
    return vec(flip ? -90 : 90, -300);
  }
};

export { PieThrowAbility };
