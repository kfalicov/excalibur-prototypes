import { StateMachine } from 'excalibur';

const StateLiterals = [
  'stand',
  'walk',
  'run',
  'prejump',
  'jump',
  'rise',
  'apex',
  'fall',
  'plummet',
] as const;

const States = Object.fromEntries(StateLiterals.map((s) => [s, s])) as {
  [K in (typeof StateLiterals)[number]]: K;
};

type State = keyof typeof States;

const StrongmanAnimStateMachine = StateMachine.create(
  {
    start: States.stand,
    states: {
      [States.stand]: {
        transitions: ['*'],
      },
      [States.walk]: {
        transitions: ['*'],
      },
      [States.run]: { transitions: [] },
      [States.prejump]: {
        transitions: [States.jump],
        onEnter({ data }) {
          data.timeInCurrentState = 0;
        },
        onUpdate: (data) => {
          if (data.timeInCurrentState > 2) {
            StrongmanAnimStateMachine.go(States.jump);
          }
        },
      },
      [States.jump]: {
        transitions: [States.rise],
        onEnter({ data }) {
          data.foot = (data.foot + 1) % 2;
          data.timeInCurrentState = 0;
        },
        onUpdate: (data) => {
          if (data.timeInCurrentState > 2) {
            StrongmanAnimStateMachine.go(States.rise);
          }
        },
      },
      [States.rise]: {
        transitions: [States.apex, States.jump],
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
          if (data.timeInCurrentState > 30)
            StrongmanAnimStateMachine.go(States.plummet);
        },
      },
      [States.plummet]: {
        transitions: [States.stand, States.walk, States.run, States.jump],
      },
    },
  },
  { timeInCurrentState: 0, foot: 0 },
);

export { States, StrongmanAnimStateMachine };
export type { State };
