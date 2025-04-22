import {
  Actor,
  CollisionGroup as _CollisionGroup,
  CollisionStartEvent,
  CollisionType,
  Color,
  Engine,
  Scene,
  vec,
} from 'excalibur';
import { CollisionGroup } from './collision';
import { Resources } from '../resources/resources';

class Projectile extends Actor {
  constructor(
    x: number,
    y: number,
    dx: number,
    dy: number,
    size: 0 | 1 | 2,
    private collisionGroup: _CollisionGroup,
  ) {
    super({
      pos: vec(x, y),
      vel: vec(dx, dy),
      width: 10,
      height: 10,
      acc: vec(0, 1000),
      color: Color.Black,
    });
    switch (size) {
      case 0:
        this.graphics.use(Resources.pie_sm.toSprite());
        break;
      case 1:
        this.graphics.use(Resources.pie_md.toSprite());
        break;
      case 2:
        this.graphics.use(Resources.pie_lg.toSprite());
        break;
    }
    this.graphics.offset = vec(8, -3);
    this.graphics.anchor = vec(0.5, 0.5);

    // this.actions.repeatForever((repeatCtx) => {
    //   repeatCtx.rotateBy(Math.PI, Math.PI * 2, RotationType.Clockwise);
    // });
  }

  onInitialize(engine: Engine) {
    this.body.collisionType = CollisionType.Passive;
    this.body.group = this.collisionGroup;
    this.on('collisionstart', (e) => this.onCollisionStart(e));
  }

  private onCollisionStart(evt: CollisionStartEvent) {
    this.kill();
  }
}

class ProjectileFactory {
  constructor(private scene: Scene) {}

  spawn(x: number, y: number, dx: number, dy: number, size: 0 | 1 | 2) {
    const projectile = new Projectile(
      x,
      y,
      dx,
      dy,
      size,
      CollisionGroup.PlayerProjectile,
    );
    this.scene.add(projectile);
  }
}

export { ProjectileFactory, Projectile };
