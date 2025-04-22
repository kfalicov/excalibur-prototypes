import { CollisionGroup } from './collision';

describe('CollisionGroup', () => {
  beforeEach(() => {
    for (const key in CollisionGroup) {
      const group = CollisionGroup[key as keyof typeof CollisionGroup];
      console.log(
        group.name.padEnd(50, ' '),
        (group.category >>> 0).toString(2).padStart(32, '0'),
        (group.mask >>> 0).toString(2).padStart(32, '0'),
      );
    }
  });
  describe('Ground', () => {
    it('should not collide with itself', () => {
      expect(CollisionGroup.Ground.canCollide(CollisionGroup.Ground)).toBe(
        false,
      );
      expect(CollisionGroup.Ground.canCollide(CollisionGroup.Player)).toBe(
        true,
      );
      expect(CollisionGroup.Ground.canCollide(CollisionGroup.NonPlayer)).toBe(
        true,
      );
      expect(
        CollisionGroup.Ground.canCollide(CollisionGroup.PlayerProjectile),
      ).toBe(true);
      expect(
        CollisionGroup.Ground.canCollide(CollisionGroup.EnemyProjectile),
      ).toBe(true);
    });
  });

  describe('Player', () => {
    it('should collide with Ground and NonPlayer', () => {
      expect(CollisionGroup.Player.canCollide(CollisionGroup.Ground)).toBe(
        true,
      );

      expect(CollisionGroup.Player.canCollide(CollisionGroup.NonPlayer)).toBe(
        true,
      );
      expect(
        CollisionGroup.Player.canCollide(CollisionGroup.EnemyProjectile),
      ).toBe(true);
    });

    it('should not collide with Player, PlayerProjectile, or EnemyProjectile', () => {
      expect(CollisionGroup.Player.canCollide(CollisionGroup.Player)).toBe(
        false,
      );
      expect(
        CollisionGroup.Player.canCollide(CollisionGroup.PlayerProjectile),
      ).toBe(false);
    });
  });

  describe('NonPlayer', () => {
    it('should collide with Player and Ground', () => {
      expect(CollisionGroup.NonPlayer.canCollide(CollisionGroup.Player)).toBe(
        true,
      );
      expect(CollisionGroup.NonPlayer.canCollide(CollisionGroup.Ground)).toBe(
        true,
      );
      expect(
        CollisionGroup.NonPlayer.canCollide(CollisionGroup.PlayerProjectile),
      ).toBe(true);
    });

    it('should not collide with NonPlayer, PlayerProjectile, or EnemyProjectile', () => {
      expect(
        CollisionGroup.NonPlayer.canCollide(CollisionGroup.NonPlayer),
      ).toBe(false);

      expect(
        CollisionGroup.NonPlayer.canCollide(CollisionGroup.EnemyProjectile),
      ).toBe(false);
    });
  });

  describe('PlayerProjectile', () => {
    it('should collide with NonPlayer and Ground', () => {
      expect(
        CollisionGroup.PlayerProjectile.canCollide(CollisionGroup.NonPlayer),
      ).toBe(true);
      expect(
        CollisionGroup.PlayerProjectile.canCollide(CollisionGroup.Ground),
      ).toBe(true);
    });

    it('should not collide with Player, PlayerProjectile, or EnemyProjectile', () => {
      expect(
        CollisionGroup.PlayerProjectile.canCollide(CollisionGroup.Player),
      ).toBe(false);
      expect(
        CollisionGroup.PlayerProjectile.canCollide(
          CollisionGroup.PlayerProjectile,
        ),
      ).toBe(false);
      expect(
        CollisionGroup.PlayerProjectile.canCollide(
          CollisionGroup.EnemyProjectile,
        ),
      ).toBe(false);
    });
  });

  describe('EnemyProjectile', () => {
    it('should collide with Player and Ground', () => {
      expect(
        CollisionGroup.EnemyProjectile.canCollide(CollisionGroup.Player),
      ).toBe(true);
      expect(
        CollisionGroup.EnemyProjectile.canCollide(CollisionGroup.Ground),
      ).toBe(true);
    });

    it('should not collide with NonPlayer, PlayerProjectile, or EnemyProjectile', () => {
      expect(
        CollisionGroup.EnemyProjectile.canCollide(CollisionGroup.NonPlayer),
      ).toBe(false);
      expect(
        CollisionGroup.EnemyProjectile.canCollide(
          CollisionGroup.PlayerProjectile,
        ),
      ).toBe(false);
      expect(
        CollisionGroup.EnemyProjectile.canCollide(
          CollisionGroup.EnemyProjectile,
        ),
      ).toBe(false);
    });
  });
});
