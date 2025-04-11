import {
  BodyComponent,
  InputHost,
  Keys,
  Query,
  System,
  SystemPriority,
  SystemType,
  World,
} from 'excalibur';
import { MobilityComponent } from '../components/mobility';
import { ControllableComponent } from '../components/controllable';

const UP = 0b00001; //0
const RIGHT = 0b00010; //1
const DOWN = 0b00100; //2
const LEFT = 0b01000; //3

const NUM_DIRS = 4;

//the lower 8 bits represent the first 2 ticks of directional input
const MASK = 0b11111111;

const A = 0b0001; //0
const B = 0b0010; //1
const X = 0b0100; //2
const Y = 0b1000; //3

const NUM_BUTTONS = 4;

const combo = [UP, B];
const combo2 = [RIGHT, RIGHT];

//how slow is the combo allowed to be input? Think of this as the allowed time in frames between inputs
const COMFORT = 5;
//how many unique inputs are we allowing in the combo?
const MAX_COMBO = 3;

class ComboSystem extends System {
  query: Query<
    | typeof BodyComponent
    | typeof MobilityComponent
    | typeof ControllableComponent
  >;
  input: InputHost;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Higher;

  buffer: number[] = [];

  //LSB = current tick, MSB = previous tick
  directions = {
    press: 0,
    hold: 0,
    release: 0,
  };

  //LSB = current tick, MSB = previous tick
  buttons = {
    press: 0,
    hold: 0,
    release: 0,
  };

  controls = {
    Left: [Keys.A],
    Right: [Keys.D],
    Up: [Keys.W],
    Down: [Keys.S],
    Jump: [Keys.Space],
    Attack: [Keys.N],
  } as const;

  constructor(world: World, input: InputHost) {
    super();
    this.query = world.query([ControllableComponent]);
    this.input = input;
  }

  public update(elapsedMs: number) {
    if (!this.input) return;

    const directions =
      0b00000 |
      (this.isHeld('Up') << 0) |
      (this.isHeld('Right') << 1) |
      (this.isHeld('Down') << 2) |
      (this.isHeld('Left') << 3);

    this.directions.hold =
      ((this.directions.hold << NUM_DIRS) | directions) & MASK;
    this.directions.press =
      ((this.directions.press << NUM_DIRS) | directions) & MASK;

    this.directions.release =
      ((this.directions.release << NUM_DIRS) |
        ((this.directions.hold >> NUM_DIRS) & ~this.directions.hold)) &
      MASK;

    this.log(this.directions);

    this.buffer = this.buffer.slice(-(COMFORT * MAX_COMBO + 1));

    this.checkCombo(combo2);
  }

  log(record: Record<string, number>) {
    console.log(
      `hold:   ${record.hold.toString(2).padStart(8, '0')}\npress:  ${record.press.toString(2).padStart(8, '0')}\nrelease:${record.release.toString(2).padStart(8, '0')}`,
    );
  }

  isHeld(control: keyof typeof this.controls) {
    const [key] = this.controls[control];

    return this.input.keyboard.isHeld(key) ? 1 : 0;
  }

  checkCombo(combo: number[]) {}
}

export { ComboSystem };
