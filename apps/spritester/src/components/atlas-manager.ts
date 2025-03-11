import { packRects } from './potpack';

function atlasManager(canvas: HTMLCanvasElement) {
  console.info('Beginning Atlas Manager canvas app');
  const context = canvas.getContext('2d');
  if (!context) {
    throw "Can't find the canvas context.";
  }

  const sprites: HTMLImageElement[] = [];

  const redraw = () => {
    console.log('redrew');
    const packed = packRects(
      sprites.map((img) => ({
        width: img.width,
        height: img.height,
        src: img,
      })),
    );
    context.clearRect(0, 0, canvas.width, canvas.height);
    packed.boxes.forEach(({ src, x, y }, index) => {
      context.drawImage(src, x, y);
    });
  };

  const addImages = (files: File[]) => {
    return files.map((file) => {
      const { promise, resolve, reject } =
        Promise.withResolvers<HTMLImageElement>();
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          sprites.push(img);
          redraw();
          resolve(img);
        };
        if (e.target?.result) img.src = e.target.result as string;
      };
      reader.readAsDataURL(file);
      return promise;
    });
  };

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
  };
}

type AtlasState = ReturnType<typeof atlasManager>;

export { atlasManager };
export type { AtlasState };
