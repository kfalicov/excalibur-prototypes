import { Actor, CollisionContact, CollisionType, Component, Side, Vector } from 'excalibur';

/**
 * Tracks which entities are touching this entity currently.
 *
 * left, right, top, and bottom will contain active or fixed entities,
 * while passives will contain passive entities.
 */
export class TouchingComponent extends Component {
    declare owner: Actor;
    type = 'touching';

    origin: Vector = Vector.Zero;

    private contacts = new Map<
        string,
        {
            contact: CollisionContact
            actor: Actor
            side: Side
        }
    >();

    [Side.Left] = new Set<Actor>();
    [Side.Right] = new Set<Actor>();
    [Side.Top] = new Set<Actor>();
    [Side.Bottom] = new Set<Actor>();

    /**
     * Entities that are touching this entity but are not solid. They are
     * not tracked by side because they can move through the entity.
     */
    passives = new Set<Actor>()

    onAdd(owner: Actor): void {
        super.onAdd?.(owner);
        this.origin = new Vector(owner.pos.x, owner.pos.y);
        // collect up all of the collisionstart/end events for each frame
        owner.on('collisionstart', (ev) => {
            if (ev.other.collider) {
                // console.log(ev.contact.colliderA.worldPos, ev.contact.colliderB.worldPos)
                if (ev.other.body?.collisionType === CollisionType.Passive) {
                    this.passives.add(ev.other)
                } else {
                    const side = ev.side;

                    this.contacts.set(ev.contact.id, {
                        contact: ev.contact,
                        actor: ev.other,
                        side,
                    })
                    this.updateSides()
                }
            }
        })

        owner.on('collisionend', (ev) => {
            if (ev.other.body?.collisionType === CollisionType.Passive) {
                this.passives.delete(ev.other)
            } else {
                this.contacts.delete(ev.lastContact.id)
                this.updateSides()
            }
        })
    }

    private updateSides() {
        this[Side.Left].clear()
        this[Side.Right].clear()
        this[Side.Top].clear()
        this[Side.Bottom].clear()

        for (const { side, actor } of this.contacts.values()) {
            this[side].add(actor)
        }
    }
}