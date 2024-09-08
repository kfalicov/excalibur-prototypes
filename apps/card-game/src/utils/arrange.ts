import { ActionsComponent, EasingFunctions, Entity, Vector } from "excalibur";

/**
 * creates an array of vectors that are evenly spaced between start and end (inclusive)
 * please provide a count of at least 2
 */
// const arrange = (start: Vector, end: Vector, count: number) => {
//     const result = [];
//     let magnitude = end.sub(start).scale(1 / (count - 1));
//     for (let i = 0; i < count; i++) {
//         result.push(start.add(magnitude.scale(i)));
//     }
//     return result;
// }

/**
 * given a list of entities, arrange them evenly spaced between start and end
 */
const arrange = (entities: Entity[], start: Vector, end: Vector) => {
    entities.forEach((entity, i) => {
        const pos = end.sub(start).scale(i / (entities.length - 1)).add(start);
        entity.get(ActionsComponent)?.delay(i * 50).easeTo(pos, 400, EasingFunctions.EaseOutQuad);
    });

}

export { arrange };

