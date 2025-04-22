import {
  CollisionGroup as _CollisionGroup,
  CollisionGroupManager,
} from 'excalibur';

const Category = {
  Ground: CollisionGroupManager.create('ground'),
  Player: CollisionGroupManager.create('player'),
  NonPlayer: CollisionGroupManager.create('nonplayer'),
  Projectile: CollisionGroupManager.create('projectile'),
} as const;

const extend = (category: _CollisionGroup, name = category.name) => {
  return {
    collidesWith: (others: _CollisionGroup[]) => {
      return new _CollisionGroup(
        name,
        category.category,
        others.reduce((current, g) => g.category | current, 0b0),
      );
    },
  };
};

const CollisionGroup = {
  Ground: Category.Ground,
  Player: extend(Category.Player).collidesWith([
    Category.Ground,
    Category.NonPlayer,
    Category.Projectile,
  ]),
  NonPlayer: extend(Category.NonPlayer).collidesWith([
    Category.Ground,
    Category.Player,
    Category.Projectile,
  ]),
  PlayerProjectile: extend(
    Category.Projectile,
    'player-projectile',
  ).collidesWith([Category.Ground, Category.NonPlayer]),
  EnemyProjectile: extend(Category.Projectile, 'enemy-projectile').collidesWith(
    [Category.Ground, Category.Player],
  ),
} as const;

export { CollisionGroup };
