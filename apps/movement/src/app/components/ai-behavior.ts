import { Actor, Component } from 'excalibur';

type FollowBehavior = {follow:Actor};
type IdleBehavior = {idle:number};
type SplitBehavior = {
split: {
  [key: number]: FollowBehavior | IdleBehavior | SplitBehavior;
}}

type Behavior = FollowBehavior|IdleBehavior|SplitBehavior;

/**
 * a component of an entity that represents their behavior
 */
class AIBehavior extends Component {
  timeInState:number = 0;
  tree:Behavior;
  constructor(behavior:Behavior) {
    super();
  }
}

export { AIBehavior };
