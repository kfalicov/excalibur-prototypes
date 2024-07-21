import { Component } from "excalibur";

/**
 * a component of an entity that represents their mobility properties
 */
class MobilityComponent extends Component {
    acc = { x: 500, y: 500 }
    // terminal velocity
    max = { x: 150, y: 150 }
    damp = { x: 0.92, y: 1 }
    jump = 500
    constructor() {
        super();
    }
}

export { MobilityComponent };

