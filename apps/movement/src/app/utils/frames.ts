import { range, SpriteSheet } from 'excalibur';

type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

const isTupleOfAtLeast = <T, N extends number>(
  tuple: T[],
  minLength: N,
): tuple is Tuple<T, N> => tuple.length >= minLength;

/**
 * dangerously trusts that the index within `clownViews` json is going to be the same
 * as the index used by the sprite sheet after Excalibur loads it
 */
const frameLookup = (sheet: SpriteSheet, query: string) =>
  sheet.sprites.findIndex(({ sourceView }) => sourceView.name === query);

/**
 * generate a set of frame names that will be picked from the sprite sheet
 * to construct an animation
 */
const generateFramesByName = (
  sheet: SpriteSheet,
  startIndex: number,
  endIndex: number,
  prefix?: string,
  padding?: number,
) => {
  return range(startIndex, endIndex)
    .map((i) =>
      frameLookup(sheet, `${prefix}${`${i}`.padStart(padding ?? 0, '0')}`),
    )
    .filter((i) => i >= 0);
};

export type { Tuple };
export { isTupleOfAtLeast, generateFramesByName };
