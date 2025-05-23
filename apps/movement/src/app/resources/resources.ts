import { Color, DefaultLoader, Engine, ImageSource, ImageWrapping, SpriteSheet } from 'excalibur';

import loaderImg from '../../assets/loader.png';
import arthurSrc from '../../assets/arthur/spritesheet.png';
import arthurViews from '../../assets/arthur/sourceviews.json';

import skybox from '../../assets/background/1.png';
import cloud from '../../assets/background/2.png';
import hills from '../../assets/background/3.png';
import trees from '../../assets/background/4.png';

/**
 * TODO move these to a spritesheet for the pie ability or the base clown sheet
 */

const Resources = {
  arthur: new ImageSource(arthurSrc),
  skybox: new ImageSource(skybox, { wrapping: ImageWrapping.Repeat }),
  cloud: new ImageSource(cloud, { wrapping: ImageWrapping.Repeat }),
  hills: new ImageSource(hills, { wrapping: ImageWrapping.Repeat }),
  trees: new ImageSource(trees, { wrapping: ImageWrapping.Repeat }),
} as const;

const loaderSprite = new Image();
loaderSprite.src = loaderImg;

//how much to affect the sin/cos cutoffs. 1 is a perfect circle.
//higher values create more sharp movement.
const sharpness = 1.4;

const getTrailPos = (time: number) => {
  return {
    x: Math.min(Math.max(Math.sin(time) * -sharpness, -1), 1),
    y: Math.min(Math.max(Math.cos(time) * sharpness, -1), 1),
  };
};

class CustomLoader extends DefaultLoader {
  private elapsedTime = 0;
  /**length of the trail in segments */
  private trailCount = 10;
  /**delay between each segment of the trail, in seconds */
  private trailDelay = 0.025;
  private radius = 8;
  private period = 0.1;

  /**
   * Optionally override the onUpdate
   * @param engine
   * @param elapsedMilliseconds
   */
  onUpdate(engine: Engine, elapsedMilliseconds: number): void {
    this.elapsedTime += elapsedMilliseconds;
  }

  override onDraw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = Color.Black.toRGBA();
    ctx.fillRect(
      0,
      0,
      this.engine.screen.resolution.width,
      this.engine.screen.resolution.height,
    );

    ctx.save();

    const centerX = this.engine.screen.resolution.width / 2;
    const centerY = this.engine.screen.resolution.height / 2;

    if (this.progress < 1) {
      // Use nearest neighbor scaling
      ctx.imageSmoothingEnabled = false;

      const seconds = this.elapsedTime / 1000;

      // Draw the trail
      for (let i = 0; i < this.trailCount; i++) {
        // Calculate the opacity and scale of the image based on its position in the trail
        const factor = (this.trailCount - i) / this.trailCount;
        const opacity = Math.min(factor, 1);
        const scale = Math.min(0.25 + factor * 0.75, 1); // Scale from 25% to 100%

        // Set the global alpha to the opacity
        ctx.globalAlpha = opacity;

        // Draw the image at the position
        const position = getTrailPos(
          (seconds - i * this.trailDelay) / this.period,
        );
        const imageX =
          position.x * this.radius + centerX - (loaderSprite.width / 2) * scale;
        const imageY =
          position.y * this.radius +
          centerY -
          (loaderSprite.height / 2) * scale;
        const width = loaderSprite.width * scale;
        const height = loaderSprite.height * scale;
        ctx.drawImage(loaderSprite, imageX, imageY, width, height);
      }
    } else {
      // Disable anti-aliasing
      ctx.imageSmoothingEnabled = false;

      // Draw a filled, opaque triangle
      ctx.beginPath();
      ctx.moveTo(centerX - 16, centerY - 16);
      ctx.lineTo(centerX + 16, centerY);
      ctx.lineTo(centerX - 16, centerY + 16);
      ctx.closePath();
      ctx.fillStyle = Color.White.toRGBA();
      ctx.fill();

      // Enable anti-aliasing
      ctx.imageSmoothingEnabled = true;
    }
  }

  override async onUserAction(): Promise<void> {
    const { resolve, promise } = Promise.withResolvers<void>();
    const canvasElement = this.engine.canvas;
    const listener = () => {
      this.canvas.flagDirty();
      canvasElement.removeEventListener('pointerup', listener);
      resolve();
    };
    canvasElement.addEventListener('pointerup', listener);
    return promise;
  }
}

const loader = new CustomLoader();

const arthurSheet = SpriteSheet.fromImageSourceWithSourceViews({
  image: Resources.arthur,
  sourceViews: arthurViews,
});

for (const res in Resources) {
  loader.addResource(Resources[res as keyof typeof Resources]);
}

export { Resources, loader, arthurSheet };
