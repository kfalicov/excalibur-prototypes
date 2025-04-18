import { StateMachine } from 'excalibur';

const StateLiterals = ['windup', 'toss', 'external'] as const;

const States = Object.fromEntries(StateLiterals.map((s) => [s, s])) as {
  [K in (typeof StateLiterals)[number]]: K;
};

type State = keyof typeof States;

const PieAnimStateMachine = StateMachine.create(
  {
    start: States.external,
    states: {
      [States.windup]: {
        transitions: [States.toss],
      },
      [States.toss]: {
        transitions: ['*'],
        onEnter({ data }) {
          data.timeInCurrentState = 0;
        },
        onExit({ data, to }) {
          return to === 'windup' || data.timeInCurrentState > 8;
        },
      },
      [States.external]: {
        transitions: ['*'],
      },
    },
  },
  { timeInCurrentState: 0 },
);

export { States, PieAnimStateMachine };
export type { State };
