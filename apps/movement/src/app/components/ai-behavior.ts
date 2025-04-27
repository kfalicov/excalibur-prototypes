import { Component, Entity } from 'excalibur';
import {
  BehaviorTree,
  FAILURE,
  Random,
  RUNNING,
  Selector,
  Sequence,
  SUCCESS,
  Task,
} from 'behaviortree';

const CheckTarget = new Task({
  name: 'check',
  run: (blackboard) => {
    if (!blackboard.self || !blackboard.target) {
      console.log('failed target check');
      return FAILURE;
    }
  },
});

const Chase = new Task({
  name: 'chase',
  start: (blackboard) => {
    console.log(Chase.name);
  },
  run: (blackboard) => {
    blackboard.attempts ??= 0;
    blackboard.intent ??= {};
    blackboard.attempts++;
    const distance = blackboard.self.pos.x - blackboard.target.pos.x;
    if (Math.abs(distance) < 48) {
      blackboard.attempts = 0;
      return SUCCESS;
    }

    if (blackboard.attempts > 10) {
      blackboard.attempts = 0;
      return FAILURE;
    }

    blackboard.intent.Left = Math.sign(distance) > 0;
    blackboard.intent.Right = Math.sign(distance) < 0;

    return RUNNING;
  },
});

const Jump = new Task({
  name: 'jump',
  start: () => {
    console.log(Jump.name);
  },
  run: (blackboard) => {
    return SUCCESS;
  },
});

const Attack = new Random({
  name: 'attack',
  start: (blackboard) => {
    console.log(Attack.name);
    blackboard.intent = {};
  },
  nodes: [
    new Task({
      name: 'punch',
      run: (blackboard) => {
        return SUCCESS;
      },
    }),
    new Task({
      name: 'grab',
      run: (blackboard) => {
        return SUCCESS;
      },
    }),
  ],
});

const Retarget = new Task({
  name: 'retarget',
  start: (blackboard) => {
    console.log(Retarget.name);
    blackboard.target = blackboard.targets[0];
    blackboard.intent = {};
  },
  end: () => {},
  run: (blackboard) => {
    if (blackboard.targets.length === 0) {
      return FAILURE;
    }
    return SUCCESS;
  },
});

const MoveNear = new Selector({
  name: 'move-near',
  start: (blackboard) => {
    console.log(MoveNear.name);
  },
  nodes: [
    new Sequence({
      nodes: [Chase, Attack],
    }),
    new Sequence({
      nodes: [Jump, Attack],
    }),
  ],
});

const selector = new Random({
  nodes: [
    new Selector({
      nodes: [
        new Sequence({
          nodes: [CheckTarget, MoveNear],
        }),
        Retarget,
      ],
    }),
    Retarget,
  ],
});

const bTree = new BehaviorTree({
  tree: selector,
  blackboard: {
    target: null,
  },
});

/**
 * a component of an entity that represents their behavior
 */
class AIBehavior extends Component {
  timeInState: number = 0;
  /**
   * how many frames between behavior updates?
   */
  frequency: number = 60;

  constructor(public tree: BehaviorTree = bTree) {
    super();
  }

  onAdd(owner: Entity) {
    this.tree.blackboard.self = owner;
  }
}

export { AIBehavior };
