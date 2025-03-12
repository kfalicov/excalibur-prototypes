import { packRects } from './potpack';

type HitArea = {
  width: number;
  height: number;
  /**
   * the adjusted location within the spritesheet where the full image should be drawn
   */
  offset: { x: number; y: number };
};

/**
 * identify the occupied space of the image, shrinking the bounding box to strictly encompass
 * the non-transparent pixels
 * @param img
 */
function shrinkWrap(img: HTMLImageElement) {
  const { width, height } = img;
  const context = new OffscreenCanvas(width, height).getContext('2d');
  if (!context) {
    throw 'offscreen canvas context not initialized correctly';
  }
  context.drawImage(img, 0, 0, img.width, img.height);
  const { data: pixels } = context.getImageData(0, 0, width, height);
  const bounds = { top: height, left: width, right: 0, bottom: 0 };

  for (const row of Array(height).keys()) {
    for (const col of Array(width).keys()) {
      if (pixels[row * width * 4 + col * 4 + 3] !== 0) {
        if (row < bounds.top) bounds.top = row;
        if (col < bounds.left) bounds.left = col;
        if (col > bounds.right) bounds.right = col;
        if (row > bounds.bottom) bounds.bottom = row;
      }
    }
  }
  return {
    x: bounds.left,
    y: bounds.top,
    width: bounds.right - bounds.left,
    height: bounds.bottom - bounds.top,
  };
}

type ImageMetadata = {
  image: HTMLImageElement;
  meta: {
    shrinkwrapped: { x: number; y: number; width: number; height: number };
  };
};

function trim(img: ImageMetadata): HitArea {
  return {
    offset: { x: -img.meta.shrinkwrapped.x, y: -img.meta.shrinkwrapped.y },
    width: img.meta.shrinkwrapped.width,
    height: img.meta.shrinkwrapped.height,
  };
}

function bounds(img: ImageMetadata): HitArea {
  return {
    offset: { x: 0, y: 0 },
    width: img.image.width,
    height: img.image.height,
  };
}

function pad(size: number): (v: HitArea) => HitArea {
  return function (input: HitArea) {
    return {
      offset: {
        x: input.offset.x - size,
        y: input.offset.y - size,
      },
      width: input.width + size * 2,
      height: input.height + size * 2,
    };
  };
}

/**
 * given the list of sprites and the packing protocol,
 * determine the widths and the offsets of each image
 */
function itemPreprocessing<T>(
  fn: (arg: T) => HitArea,
): (sprites: T[]) => (T & HitArea)[] {
  return (sprites: T[]) =>
    sprites.map((sprite) => ({
      ...sprite,
      ...fn(sprite),
    }));
}

function atlasManager(canvas: HTMLCanvasElement) {
  console.info('Beginning Atlas Manager canvas app');
  const context = canvas.getContext('2d');
  if (!context) {
    throw "Can't find the canvas context.";
  }

  const sprites: ImageMetadata[] = [];
  let packingBehavior = bounds;

  const redraw = () => {
    console.log('redrew');
    const itemComputation = itemPreprocessing(packingBehavior);
    const packed = packRects(itemComputation(sprites));
    context.clearRect(0, 0, canvas.width, canvas.height);
    packed.boxes.forEach(({ image, x, y, offset }, index) => {
      context.drawImage(image, x + offset.x, y + offset.y);
    });
  };

  const addImages = (files: File[]) => {
    const imageLoadStates = files.map((file) => {
      const { promise, resolve, reject } =
        Promise.withResolvers<HTMLImageElement>();
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          const shrinkwrapped = shrinkWrap(img);
          sprites.push({
            image: img,
            meta: { shrinkwrapped },
          });
          redraw();
          resolve(img);
        };
        if (e.target?.result) img.src = e.target.result as string;
      };
      reader.readAsDataURL(file);
      return promise;
    });

    return Promise.all(imageLoadStates);
  };

  function setPackingBehavior(
    _packingBehavior: (img: ImageMetadata) => HitArea,
  ) {
    packingBehavior = _packingBehavior;
    redraw();
  }

  /**
   * setup observer to auto bump the canvas resolution when the viewport changes
   */
  const ro = new ResizeObserver((entries) => {
    context.canvas.width = canvas.offsetWidth;
    context.canvas.height = canvas.offsetHeight;
    redraw();
  });
  ro.observe(document.body);

  return {
    addImages,
    setPackingBehavior,
  };
}

type AtlasState = ReturnType<typeof atlasManager>;

export { atlasManager, trim, bounds };
export type { AtlasState };
