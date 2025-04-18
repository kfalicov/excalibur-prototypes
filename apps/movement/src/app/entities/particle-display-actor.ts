import { Actor, ImageSource, Vector } from 'excalibur';

export class ParticleDisplayActor extends Actor {
  private canvasTexture: ImageSource;
  private offscreenCanvas: OffscreenCanvas;
  
  constructor(offscreenCanvas: OffscreenCanvas, x: number, y: number, width: number, height: number) {
    super({
      pos: new Vector(x, y),
      width: width,
      height: height
    });
    
    this.offscreenCanvas = offscreenCanvas;
    // Create an ImageSource from the canvas
    this.canvasTexture = new ImageSource(this.offscreenCanvas);
  }
  
  onPreUpdate(engine, delta) {
    super.onPreUpdate(engine, delta);
    
    // Update the texture with the latest canvas content
    this.canvasTexture.refresh();
    
    // Use the updated texture as the graphic
    this.graphics.use(this.canvasTexture.toSprite());
  }
}