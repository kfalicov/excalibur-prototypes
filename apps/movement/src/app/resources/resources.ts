import { Color, DefaultLoader, Engine, ImageSource, SpriteSheet } from "excalibur";

import loaderImg from "../../assets/loader.png";
import monkeyFile from "../../assets/monkey.png";

const Resources = {
    monkey: new ImageSource(monkeyFile),
}

const loaderSprite = new Image();
loaderSprite.src = loaderImg;

//how much to affect the sin/cos cutoffs. 1 is a perfect circle. 
//higher values create more sharp movement.
const sharpness = 1.4;

const getTrailPos = (time) => {
    return {
        x: Math.min(Math.max(Math.sin(time) * -(sharpness), -1), 1),
        y: Math.min(Math.max(Math.cos(time) * sharpness, -1), 1)
    }
}

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
        ctx.fillRect(0, 0, this.engine.screen.resolution.width, this.engine.screen.resolution.height);

        ctx.save();

        const centerX = this.engine.screen.resolution.width / 2;
        const centerY = this.engine.screen.resolution.height / 2

        if (this.progress < 1) {// Use nearest neighbor scaling
            ctx.imageSmoothingEnabled = false;

            const seconds = this.elapsedTime / 1000;

            // Draw the trail
            for (let i = 0; i < this.trailCount; i++) {
                // Calculate the opacity and scale of the image based on its position in the trail
                const factor = ((this.trailCount - i) / this.trailCount);
                const opacity = Math.min(factor, 1.);
                const scale = Math.min(.25 + (factor * 0.75), 1.); // Scale from 25% to 100%

                // Set the global alpha to the opacity
                ctx.globalAlpha = opacity;

                // Draw the image at the position
                const position = getTrailPos((seconds - (i * this.trailDelay)) / this.period);
                const imageX = position.x * this.radius + centerX - (loaderSprite.width / 2 * scale);
                const imageY = position.y * this.radius + centerY - (loaderSprite.height / 2 * scale);
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
        let res, rej;
        const promise = new Promise<void>((resolve, reject) => {
            res = resolve;
            rej = reject;
        });
        const canvasElement = this.engine.canvas;
        const listener = () => {
            this.canvas.flagDirty();
            canvasElement.removeEventListener('pointerup', listener);
            res();
        };
        canvasElement.addEventListener('pointerup', listener);
        return promise;
    }


}

const loader = new CustomLoader();

const monkeySpritesheet = SpriteSheet.fromImageSource({
    image: Resources.monkey,
    grid: {
        columns: 4,
        rows: 4,
        spriteWidth: 16,
        spriteHeight: 16
    }
});

for (const res in Resources) {
    loader.addResource((Resources as any)[res]);
}

export { Resources, loader, monkeySpritesheet };

