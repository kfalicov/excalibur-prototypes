import {
  CollisionGroup as _CollisionGroup,
  CollisionGroupManager,
} from 'excalibur';

const Category = {
  Ground: CollisionGroupManager.create('ground'),
  Player: CollisionGroupManager.create('player'),
  NonPlayer: CollisionGroupManager.create('nonplayer'),
  PlayerProjectile: CollisionGroupManager.create('player-projectile'),
  EnemyProjectile: CollisionGroupManager.create('enemy-projectile'),
} as const;

const CollisionGroup = {
  Ground: Category.Ground,
  Player: _CollisionGroup.collidesWith([Category.Ground]),
  NonPlayer: _CollisionGroup.collidesWith([Category.Ground]),
  PlayerProjectile: _CollisionGroup.collidesWith([
    Category.NonPlayer,
    Category.Ground,
  ]),
  EnemyProjectile: _CollisionGroup.collidesWith([
    Category.Player,
    Category.Ground,
  ]),
} as const;

export { CollisionGroup };
