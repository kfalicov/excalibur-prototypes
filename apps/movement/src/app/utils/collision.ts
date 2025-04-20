import {
  CollisionGroup as _CollisionGroup,
  CollisionGroupManager,
} from 'excalibur';

const Category = {
  Ground: CollisionGroupManager.create('ground'),
  Player: CollisionGroupManager.create('player'),
  NonPlayer: CollisionGroupManager.create('nonplayer'),
  PlayerProjectile: CollisionGroupManager.create('playerProjectile'),
  EnemyProjectile: CollisionGroupManager.create('enemyProjectile'),
} as const;

const CollisionGroup = {
  Ground: Category.Ground,
  Player: _CollisionGroup.collidesWith([Category.Ground, Category.NonPlayer]),
  NonPlayer: _CollisionGroup.collidesWith([
    Category.Player,
    Category.Ground,
    Category.PlayerProjectile,
  ]),
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
