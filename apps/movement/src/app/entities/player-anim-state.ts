import { BodyComponent, StateMachine } from 'excalibur';
import { TouchingComponent } from '../components/touching';

const StateLiterals = [
  'stand',
  'idle',
  'walk',
  'wallsplat',
  'run',
  'prejump',
  'jump',
  'rise',
  'ceilingsplat',
  'apex',
  'fall',
  'plummet',
  'floorsplat',
] as const;

const States = Object.fromEntries(StateLiterals.map((s) => [s, s])) as {
  [K in (typeof StateLiterals)[number]]: K;
};

type State = keyof typeof States;

type _StateMachine = {
  [K in State]: (
    body: BodyComponent,
    touching: TouchingComponent,
    context?: { timeInState: number },
  ) => State;
};

const OTBStateMachine = StateMachine.create(
  {
    start: States.stand,
    states: {
      [States.stand]: {
        transitions: ['*'],
      },
      [States.walk]: {
        transitions: ['*'],
      },
      [States.wallsplat]: {
        transitions: [States.stand],
        onEnter({ data, from }) {
          data.timeInCurrentState = 0;
          return from === States.walk || from === States.run;
        },
        onExit({ data }) {
          return data.timeInCurrentState > 3;
        },
      },
      [States.run]: { transitions: [States.wallsplat] },
      [States.idle]: { transitions: [] },
      [States.prejump]: {
        transitions: [States.jump],
        onEnter({ data }) {
          data.timeInCurrentState = 0;
        },
        onUpdate: (data) => {
          if (data.timeInCurrentState > 2) {
            OTBStateMachine.go(States.jump);
          }
        },
      },
      [States.jump]: {
        transitions: [States.rise, States.ceilingsplat],
        onEnter({ data }) {
          data.foot = (data.foot + 1) % 2;
          data.timeInCurrentState = 0;
        },
        onUpdate: (data) => {
          if (data.timeInCurrentState > 2) {
            OTBStateMachine.go(States.rise);
          }
        },
      },
      [States.ceilingsplat]: {
        transitions: [States.apex],
        onEnter({ data }) {
          data.timeInCurrentState = 0;
        },
        onExit({ data }) {
          return data.timeInCurrentState > 3;
        },
      },
      [States.rise]: {
        transitions: [States.ceilingsplat, States.apex, States.jump],
      },
      [States.apex]: { transitions: [States.fall, States.jump] },
      [States.fall]: {
        transitions: [
          States.stand,
          States.walk,
          States.run,
          States.plummet,
          States.jump,
        ],
        onEnter({ data }) {
          data.timeInCurrentState = 0;
        },
        onUpdate: (data) => {
          if (data.timeInCurrentState > 30) OTBStateMachine.go(States.plummet);
        },
      },
      [States.plummet]: {
        transitions: [States.stand, States.walk, States.run, States.jump],
      },
      [States.floorsplat]: { transitions: [States.stand] },
    },
  },
  { timeInCurrentState: 0, foot: 0 },
);

export { States, OTBStateMachine };
export type { State };
