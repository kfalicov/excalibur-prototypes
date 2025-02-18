import {
  CollisionGroup as _CollisionGroup,
  CollisionGroupManager,
} from 'excalibur';

const Category = {
  Ground: CollisionGroupManager.create('ground'),
  Player: CollisionGroupManager.create('player'),
  NonPlayer: CollisionGroupManager.create('nonplayer'),
} as const;

const CollisionGroup = {
  Ground: Category.Ground,
  Player: _CollisionGroup.collidesWith([Category.Ground]),
  NonPlayer: _CollisionGroup.collidesWith([Category.Ground]),
} as const;

export { CollisionGroup };
