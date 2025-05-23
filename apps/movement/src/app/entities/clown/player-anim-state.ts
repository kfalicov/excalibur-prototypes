import { StateMachine } from 'excalibur';

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

const PlayerAnimStateMachine = StateMachine.create(
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
        transitions: [States.stand, States.jump, States.prejump, States.walk],
        onEnter({ data, from }) {
          data.timeInCurrentState = 0;
          return from === States.walk || from === States.run;
        },
        onExit({ data, to }) {
          return (
            to === States.prejump ||
            to === States.jump ||
            to === States.walk ||
            data.timeInCurrentState > 3
          );
        },
      },
      [States.run]: { transitions: ['*'] },
      [States.idle]: { transitions: [] },
      [States.prejump]: {
        transitions: [States.jump],
        onEnter({ data }) {
          data.timeInCurrentState = 0;
        },
        onUpdate: (data) => {
          if (data.timeInCurrentState > 3) {
            PlayerAnimStateMachine.go(States.jump);
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
          if (data.timeInCurrentState > 5) {
            PlayerAnimStateMachine.go(States.rise);
          }
        },
      },
      [States.ceilingsplat]: {
        transitions: [States.fall],
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
          if (data.timeInCurrentState > 30)
            PlayerAnimStateMachine.go(States.plummet);
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

export { States, PlayerAnimStateMachine };
export type { State };
