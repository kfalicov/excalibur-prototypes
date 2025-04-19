import {
  Actor,
  BodyComponent,
  Circle,
  Color,
  Component,
  GraphicsGroup,
  GraphicsGrouping,
  vec,
  Vector,
} from 'excalibur';
import { Resources } from '../../resources/resources';
import { PieAnimStateMachine } from './pie-anim-state';

type Intent = {
  Left: boolean;
  Right: boolean;
  Up: boolean;
  Down: boolean;
  Attack: boolean;
};

const c = new Circle({ color: Color.White, radius: 2 });

const group = new GraphicsGroup({
  useAnchor: false,
  members: [
    {
      graphic: c,
      offset: vec(0, 0),
    },
    {
      graphic: c,
      offset: vec(0, 0),
    },
    {
      graphic: c,
      offset: vec(0, 0),
    },
    {
      graphic: c,
      offset: vec(0, 0),
    },
    {
      graphic: c,
      offset: vec(0, 0),
    },
    {
      graphic: c,
      offset: vec(0, 0),
    },
    {
      graphic: c,
      offset: vec(0, 0),
    },
  ] as GraphicsGrouping[],
});

const GRAV = 1000;
const adjustGroup = (vel: Vector) => {
  for (let i = 0; i < group.members.length; i++) {
    const t = (i / group.members.length) * 0.75;
    const x = 0 + vel.x * t;
    const y = 0 + vel.y * t + 0.5 * GRAV * t * t;
    (group.members[i] as GraphicsGrouping).offset = vec(x, y);
  }
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
  angleDisplay: Actor;

  constructor() {
    super();
    this.angleDisplay = new Actor({ pos: vec(0, -10), name: 'angleDisplay' });
    this.angleDisplay.graphics.anchor = Vector.Zero;
    this.angleDisplay.graphics.use(group);
  }

  onAdd(owner: Actor) {
    super.onAdd?.(owner);
    owner.addChild(this.angleDisplay);
    this.angleDisplay.pos = vec(0, -10);
  }

  compute(intent: Intent) {
    const entity = this.owner;
    if (!entity || !entity.has(BodyComponent)) return;
    const body = entity.get(BodyComponent);
    this.locks.physics = false;
    c.color = Color.Transparent;
    if (intent.Attack) {
      c.color = Color.White;
      this.locks.graphics = true;
      this.locks.physics = true;
      if (intent.Left || intent.Right) {
        entity.graphics.flipHorizontal = intent.Left;
      }

      const vel = computeThrow(intent, entity.graphics.flipHorizontal);
      adjustGroup(vel);

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
      const vel = computeThrow(intent, entity.graphics.flipHorizontal);
      PieAnimStateMachine.go('toss');
      entity.removeChild(this.heldPie);
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
  if (intent.Up) {
    return Vector.fromAngle(
      flip ? (-6 * Math.PI) / 11 : (-5 * Math.PI) / 11,
    ).scale(350);
    // return vec(flip ? -30 : 30, -400);
    //use vertical
  } else if (intent.Down) {
    return Vector.fromAngle(flip ? (5 * Math.PI) / 6 : Math.PI / 6).scale(200);
    //use diagonal down
    // return vec(flip ? -210 : 210, 70);
  } else {
    return Vector.fromAngle(flip ? -(3 * Math.PI) / 4 : -Math.PI / 4).scale(
      300,
    );
    //default direction based on flip
    // return vec(flip ? -90 : 90, -300);
  }
};

export { PieThrowAbility };
