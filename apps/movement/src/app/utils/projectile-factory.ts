import {
  Actor,
  CollisionGroup as _CollisionGroup,
  Color,
  RotationType,
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
    collisionGroup: _CollisionGroup,
  ) {
    super({
      pos: vec(x, y),
      vel: vec(dx, dy),
      width: 10,
      height: 10,
      acc: vec(0, 1000),
      collisionGroup: collisionGroup,
      color: Color.Black,
    });
    this.graphics.use(Resources.pie.toSprite());
    this.graphics.offset = vec(4, -3);
    this.on('collisionstart', () => this.kill());
    this.actions.repeatForever((repeatCtx) => {
      repeatCtx.rotateBy(Math.PI, Math.PI * 2, RotationType.Clockwise);
    });
  }
}

class ProjectileFactory {
  constructor(private scene: Scene) {}

  spawn(x: number, y: number, dx, dy) {
    console.log(x, y);
    const projectile = new Projectile(
      x,
      y,
      dx,
      dy,
      CollisionGroup.PlayerProjectile,
    );
    this.scene.add(projectile);
  }
}

export { ProjectileFactory };
