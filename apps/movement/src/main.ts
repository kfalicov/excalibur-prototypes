import {
    ContactSolveBias,
    DisplayMode,
    Engine,
    Resolution,
    SolverStrategy,
    ViewportDimension
} from 'excalibur';
import { loader } from './app/resources/resources';
import { MenuScene } from './app/scenes/menu';

const computeScaling = (resolution: ViewportDimension): ViewportDimension => {
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
        substep: 5, // < --- splits up the motion, and gives more opportunities for the solver to get it right
        arcade: {
            contactSolveBias: ContactSolveBias.VerticalFirst,
        },
        solver: SolverStrategy.Arcade,
        colliders: {
            compositeStrategy: "separate"
        },
        continuous: {
            checkForFastBodies: true
        }
    },
    maxFps: 60,
    fixedUpdateFps:60,
});

game.showDebug(true);

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
