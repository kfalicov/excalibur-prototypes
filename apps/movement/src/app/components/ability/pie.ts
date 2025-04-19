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
  members: new Array(16).fill(null).map(
    () =>
      ({
        graphic: c,
        offset: vec(0, 0),
      }) as GraphicsGrouping,
  ),
});

const GRAV = 1000;
const adjustGroup = (vel: Vector) => {
  // Use a fixed maximum distance instead of time
  const maxDistance = 150; // Maximum distance to show in the trajectory
  const timeStep = 0.01; // Small time step for accurate trajectory calculation
  const points: Vector[] = [];
  let totalLength = 0;

  // Generate points along the trajectory until we reach maxDistance
  let t = 0;
  let lastPoint = vec(0, 0);
  points.push(lastPoint);

  while (totalLength < maxDistance) {
    t += timeStep;
    const x = vel.x * t;
    const y = vel.y * t + 0.5 * GRAV * t * t;
    const currentPoint = vec(x, y);

    const segmentLength = currentPoint.distance(lastPoint);
    totalLength += segmentLength;

    points.push(currentPoint);
    lastPoint = currentPoint;
  }

  // Calculate the desired segment length for equal spacing
  const segmentLength = totalLength / (group.members.length - 1);

  // Place the first point at the start
  (group.members[0] as GraphicsGrouping).offset = vec(0, 0);

  // Place remaining points at equal distances
  let currentLength = 0;
  let currentIndex = 1;
  let prevPoint = points[0];

  for (
    let i = 1;
    i < points.length && currentIndex < group.members.length;
    i++
  ) {
    const segmentDistance = points[i].distance(prevPoint);

    // If adding this segment would exceed the next target length
    while (
      currentLength + segmentDistance >= segmentLength * currentIndex &&
      currentIndex < group.members.length
    ) {
      // Calculate how far along this segment the point should be
      const remainingLength = segmentLength * currentIndex - currentLength;
      const ratio = remainingLength / segmentDistance;

      // Interpolate between the previous point and current point
      const x = prevPoint.x + (points[i].x - prevPoint.x) * ratio;
      const y = prevPoint.y + (points[i].y - prevPoint.y) * ratio;

      (group.members[currentIndex] as GraphicsGrouping).offset = vec(x, y);
      currentIndex++;
    }

    currentLength += segmentDistance;
    prevPoint = points[i];
  }

  // If we didn't place all points (could happen due to numerical precision)
  // place remaining points at the end of the trajectory
  while (currentIndex < group.members.length) {
    const lastPoint = points[points.length - 1];
    (group.members[currentIndex] as GraphicsGrouping).offset = vec(
      lastPoint.x,
      lastPoint.y,
    );
    currentIndex++;
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
      250,
    );
    //default direction based on flip
    // return vec(flip ? -90 : 90, -300);
  }
};

export { PieThrowAbility };
