import {
    DisplayMode,
    Engine,
    Resolution,
    ScreenDimension,
    Vector,
} from 'excalibur';
import { loader } from './app/resources/resources';
import { MenuScene } from './app/scenes/menu';

const computeScaling = (resolution: ScreenDimension): ScreenDimension => {
    const scale = Math.min(
        Math.floor(window.innerWidth / resolution.width),
        Math.floor(window.innerHeight / resolution.height)
    );
    return {
        width: resolution.width * scale,
        height: resolution.height * scale,
    };
};

const game = new Engine({
    resolution: Resolution.GameBoyAdvance,
    viewport: computeScaling(Resolution.GameBoyAdvance),
    suppressHiDPIScaling: true,
    // suppressPlayButton: true,
    displayMode: DisplayMode.Fixed,
    antialiasing: false,
    physics: {
        gravity: Vector.Zero,
    },
});

/**
 * we don't care about the resize event, we only care about the performant callback
 * when any resize happens
 */
const ro = new ResizeObserver((entries) => {
    const newViewport = computeScaling(Resolution.GameBoyAdvance);
    if (
        newViewport.width !== game.screen.viewport.width ||
        newViewport.height !== game.screen.viewport.height
    ) {
        game.screen.viewport = newViewport;
        game.screen.applyResolutionAndViewport();
    }
});
ro.observe(document.body);

game.add('menu', new MenuScene());
game.start(loader).then(() => {
    game.goToScene('menu');
});
