import { Component } from 'excalibur';

/**
 * a component of an entity that represents whether they are controllable
 */
class ControllableComponent extends Component {
  enabled = true;

  constructor() {
    super();
  }
}

export { ControllableComponent };
