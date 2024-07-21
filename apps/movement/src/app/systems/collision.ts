import { CollisionGroup as _CollisionGroup } from 'excalibur'

enum Category {
    Ground = 0b0000_0001, // prettier-ignore
    Player = 0b0000_0010, // prettier-ignore
    Enemy = 0b0000_0100, // prettier-ignore
    Item = 0b0000_1000, // prettier-ignore
    PhysicalItem = 0b0001_0000, // prettier-ignore
    Hazard = 0b0010_0000, // prettier-ignore
    Climbable = 0b0100_0000, // prettier-ignore
}

export const CollisionGroup = {
    Ground: new _CollisionGroup(
        'ground',
        Category.Ground,
        collideWith(Category.Player, Category.Enemy, Category.PhysicalItem)
    ),
    Player: new _CollisionGroup(
        'player',
        Category.Player,
        collideWith(
            Category.Ground,
            Category.Enemy,
            Category.Item,
            Category.Hazard,
            Category.PhysicalItem,
            Category.Climbable
        )
    ),
    Enemy: new _CollisionGroup(
        'enemy',
        Category.Enemy,
        collideWith(Category.Ground, Category.Player)
    ),
    Hazard: new _CollisionGroup(
        'hazard',
        Category.Hazard,
        collideWith(Category.Player)
    ),
    Item: new _CollisionGroup(
        'item',
        Category.Item,
        collideWith(Category.Player)
    ),
    PhysicalItem: new _CollisionGroup(
        'phys-item',
        Category.PhysicalItem,
        collideWith(Category.Ground, Category.Player)
    ),
    Climbable: new _CollisionGroup(
        'climbable',
        Category.Climbable,
        collideWith(Category.Player)
    ),
}

/**
 * Combine multiple categories into a single bitmask
 */
function collideWith(...categories: Category[]) {
    return categories.reduce((acc, cat) => acc | cat, 0)
}