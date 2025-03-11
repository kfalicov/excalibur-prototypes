function packRects<T extends { width: number; height: number }>(rects: T[]) {
  // calculate total box area and maximum box width
  const { area, maxWidth } = rects.reduce(
    (acc, cur) => ({
      area: acc.area + cur.width * cur.height,
      maxWidth: Math.max(acc.maxWidth, cur.width),
    }),
    { area: 0, maxWidth: 0 },
  );

  // sort the boxes for insertion by height, descending
  const heightOrderedRects = rects.toSorted((a, b) => b.height - a.height);

  // aim for a squarish resulting container,
  // slightly adjusted for sub-100% space utilization
  const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);

  // start with a single empty space, unbounded at the bottom
  const spaces = [{ x: 0, y: 0, w: startWidth, h: Infinity }];

  let width = 0;
  let height = 0;

  const boxes = heightOrderedRects.map((box) => {
    const i = spaces.findLastIndex(
      (s) => box.width <= s.w && box.height <= s.h,
    );
    if (i === -1) {
      throw 'no space available for this box';
    }
    //@ts-expect-error space will always be defined as long as found
    const space: (typeof spaces)[number] = spaces[i];
    const packed = {
      x: space.x,
      y: space.y,
      ...box,
    };
    height = Math.max(height, space.y + box.height);
    width = Math.max(width, space.h + box.width);

    if (box.width === space.w && box.height === space.h) {
      // space matches the box exactly; remove it
      const last = spaces.pop();
      if (i < spaces.length) spaces[i] = last;
    } else if (box.height === space.h) {
      // space matches the box height; update it accordingly
      // |-------|---------------|
      // |  box  | updated space |
      // |_______|_______________|
      space.x += box.width;
      space.w -= box.width;
    } else if (box.width === space.w) {
      // space matches the box width; update it accordingly
      // |---------------|
      // |      box      |
      // |_______________|
      // | updated space |
      // |_______________|
      space.y += box.height;
      space.h -= box.height;
    } else {
      // otherwise the box splits the space into two spaces
      // |-------|-----------|
      // |  box  | new space |
      // |_______|___________|
      // | updated space     |
      // |___________________|
      spaces.push({
        x: space.x + box.width,
        y: space.y,
        w: space.w - box.width,
        h: box.height,
      });
      space.y += box.height;
      space.h -= box.height;
    }
    return packed;
  });

  return {
    boxes,
    width, // container width
    height, // container height
    fill: area / (width * height) || 0, // space utilization
  };
}

export { packRects };
