import { Component, Vector } from "excalibur";

/**
 * a component of an entity that represents their mobility properties
 */
class MobilityComponent extends Component {
    acc = new Vector(300, 300)
    gravity = 1450
    // terminal velocity
    max = new Vector(120, 120)
    damp = { x: 0.92, y: 1 }
    jump = 300
    constructor() {
        super();
    }
}

export { MobilityComponent };

