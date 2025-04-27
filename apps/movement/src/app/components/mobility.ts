import { Actor, BodyComponent, clamp, Component, Entity, vec, Vector } from 'excalibur';

type Intent = {
  Left: boolean;
  Right: boolean;
  Up: boolean;
  Down: boolean;
};

/**
 * a component of an entity that represents their mobility properties
 */
class MobilityComponent extends Component {
  acc = new Vector(300, 300);
  gravity = 1450;
  // terminal velocity
  max = new Vector(60, 400);
  // multiplier on velocity allowed while sprinting
  sprint = 2;
  damp = { x: 0.92, y: 1 };
  _jump = 300;
  /**
   * the delay in frames before the jump executes
   */
  jumpDelay = 3;
  aiming: boolean = false;
  /**
   * the maximum number of midair jumps available to the entity
   */
  maxMidairJumps = Infinity;
  /**
   * the currently tracked number of jumps used by the entity
   */
  midairJumpsUsed = 0;

  owner?: Actor;

  constructor() {
    super();
  }

  onAdd(owner: Actor) {
    owner.on('postupdate',()=>{
      /**
       * a hack to update the MotionSystem's inability to handle terminal velocity
       */
      // console.log("actual velocity",owner.body.vel);
      owner.body.vel = vec(
        clamp(owner.body.vel.x, -this.max.x, this.max.x),
        clamp(owner.body.vel.y, -this.max.y, this.max.y));
      // console.log("desired velocity",owner.body.vel)
      // owner.body.pos = owner.body.oldPos.add(owner.body.vel);
    })
  }

  compute(intent: Intent) {
    if (!this.owner) {
      throw 'Ownerless MobilityComponent encountered!';
    }
    if (!intent.Left && !intent.Right) {
      this.owner.body.vel.x *= this.damp.x;
    }
    //the horizontal intent
    const x = (intent.Right ? 1 : 0) - (intent.Left ? 1 : 0);
    //the vertical intent
    const y = (intent.Down ? 1 : 0) - (intent.Up ? 1 : 0);
    const climbing = false;
    const acc = new Vector(
      x * this.acc.x,
      climbing ? y * this.acc.y : this.gravity,
    );

    this.owner.body.acc = acc;
  }
  jump() {
    if (!this.owner) {
      throw 'Ownerless MobilityComponent encountered!';
    }
    if (this.midairJumpsUsed < this.maxMidairJumps) {
      this.owner.vel.y = -this._jump;
      this.midairJumpsUsed++;
    }
  }
}

export { MobilityComponent, Intent };
