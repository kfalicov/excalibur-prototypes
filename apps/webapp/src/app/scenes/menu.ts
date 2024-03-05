import { MotionComponent, Scene } from 'excalibur';
import { PlayerActor } from '../entities/player';
import { ControlSystem } from '../systems/control';

class MenuScene extends Scene {
  onInitialize(): void {
    this.add(new PlayerActor());
    this.world.add(new ControlSystem(this.world, this.engine.input));
  }
}

export { MenuScene };
