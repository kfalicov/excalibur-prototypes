import {
    Actor,
    CollisionType,
    Color
} from 'excalibur';
import { CollisionGroup } from '../systems/collision';

class Terrain extends Actor {
    constructor({ x = 120, y = 120, width = 128, height = 16 }: { x?: number, y?: number, width?: number, height?: number } = {}) {
        super({
            x,
            y,
            width,
            height,
            // Let's give it some color with one of the predefined
            // color constants
            color: Color.White,
            collisionType: CollisionType.Fixed,
            collisionGroup: CollisionGroup.Ground
        });
    }
}

export { Terrain };

