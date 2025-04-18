import {
  Color,
  DefaultLoader,
  Engine,
  ImageSource,
  SpriteSheet,
} from 'excalibur';

import loaderImg from '../../assets/loader.png';
import clownSrc from '../../assets/clown/spritesheet.png';
import clownViews from '../../assets/clown/sourceviews.json';
import dogSrc from '../../assets/dog.png';
import dogViews from '../../assets/dog.json';
import strongmanSrc from '../../assets/strongman.png';
import strongmanViews from '../../assets/strongman.json';
import pie_sm from '../../assets/projectile/pie_0.png';
import pie_md from '../../assets/projectile/pie_1.png';
import pie_lg from '../../assets/projectile/pie_2.png';

/**
 * TODO move these to a spritesheet for the pie ability or the base clown sheet
 */
import windupSrc from '../../assets/clown/throw_0.png';
import throwSrc from '../../assets/clown/throw_1.png';

const Resources = {
  clown: new ImageSource(clownSrc),
  windup: new ImageSource(windupSrc),
  toss: new ImageSource(throwSrc),
  dog: new ImageSource(dogSrc),
  strongman: new ImageSource(strongmanSrc),
  pie_sm: new ImageSource(pie_sm),
  pie_md: new ImageSource(pie_md),
  pie_lg: new ImageSource(pie_lg),
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
    const { resolve, reject, promise } = Promise.withResolvers<void>();
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

const clownSheet = SpriteSheet.fromImageSourceWithSourceViews({
  image: Resources.clown,
  sourceViews: clownViews,
});
const dogSheet = SpriteSheet.fromImageSourceWithSourceViews({
  image: Resources.dog,
  sourceViews: dogViews,
});
const strongmanSheet = SpriteSheet.fromImageSourceWithSourceViews({
  image: Resources.strongman,
  sourceViews: strongmanViews,
});

for (const res in Resources) {
  loader.addResource(Resources[res as keyof typeof Resources]);
}

export { Resources, loader, clownSheet, dogSheet, strongmanSheet };
