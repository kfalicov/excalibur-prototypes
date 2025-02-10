import { BodyComponent, Side } from 'excalibur';
import { TouchingComponent } from '../components/touching';

const StateLiterals = [
  'stand',
  'idle',
  'walk',
  'run',
  'jump',
  'rise',
  'apex',
  'fall',
] as const;

const States = Object.fromEntries(StateLiterals.map((s) => [s, s])) as {
  [K in (typeof StateLiterals)[number]]: K;
};

type State = keyof typeof States;

type StateMachine = {
  [K in State]: (
    body: BodyComponent,
    touching: TouchingComponent,
    context?: { timeInState: number },
  ) => State;
};

/**
 * AnimFSM (Finite State Machine) represents a mapping of states to their respective
 * transitions in form of functions. Each function corresponds to a specific state
 * and determines the next state based on the state's logic and the given context.
 *
 * Each key in the FSM corresponds to a state defined in `StateLiterals`.
 *
 * given the current animation state and some context about the entity, this state machine
 * chooses the next appropriate state to put the actor in
 *
 * Note:
 * - The return type of each function corresponds to the next state, represented
 *   as a string literal from `StateLiterals`.
 */
const AnimFSM = {
  [States.stand]: function (body, touching, context?) {
    if (body.vel.y > 10 && touching[Side.Bottom].size === 0) return States.fall;
    if (body.vel.y < -10) return States.jump;
    if (Math.abs(body.vel.x) > 10) return States.walk;
    if ((context?.timeInState ?? 0) > 500) return States.idle;
    return States.stand;
  },
  [States.idle]: function (body, touching) {
    const breakout = this.stand(body, touching);
    if (breakout === States.stand || breakout === States.idle)
      return States.idle;
    return breakout;
  },
  [States.walk]: function (body, touching) {
    if (touching[body.acc.x < 0 ? Side.Left : Side.Right].size > 0)
      //potential location for 'bonk' animation against wall
      return States.stand;
    //TODO this is where a 'skid' state may work well
    if (Math.abs(body.vel.x) <= 10 && Math.abs(body.acc.x) > 0)
      return States.walk;
    //currently, walking follows the same logic as standing in all circumstances
    //where it would transition to jumping or falling
    return this.stand(body, touching);
  },
  [States.run]: function () {
    throw new Error('Function not implemented.');
  },
  [States.jump]: function (body, touching, context?) {
    if ((context?.timeInState ?? 0) > 1) return States.rise;
    return States.jump;
  },
  [States.rise]: function (body, touching) {
    if (touching[Side.Top].size > 0) return States.apex;
    if (body.vel.y > -60) return States.apex;
    return States.rise;
  },
  [States.apex]: function (body) {
    if (body.vel.y > 60) return States.fall;
    return States.apex;
  },
  [States.fall]: function (body, touching) {
    if (touching[Side.Bottom].size > 0) return this.stand(body, touching);
    return States.fall;
  },
} as const satisfies StateMachine;

export { States, AnimFSM };
export type { State };
