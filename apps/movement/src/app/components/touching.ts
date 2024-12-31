import { Actor, CollisionContact, CollisionType, Component, Entity, Side, Vector } from 'excalibur';

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
            actor: Entity
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
    passives = new Set<Entity>()

    onAdd(owner: Actor): void {
        super.onAdd?.(owner);
        this.origin = new Vector(owner.pos.x, owner.pos.y);
        // collect up all of the collisionstart/end events for each frame
        owner.on('collisionstart', (ev) => {
            if (ev.other) {
                //@ts-expect-error body has to exist in order for this event to have happened
                if (ev.self.owner.body?.collisionType === CollisionType.Passive) {
                    this.passives.add(ev.other.owner)
                } else {
                    const side = ev.side;

                    this.contacts.set(ev.contact.id, {
                        contact: ev.contact,
                        actor: ev.other.owner,
                        side,
                    })
                    this.updateSides()
                }
            }
        })

        owner.on('collisionend', (ev) => {
            //@ts-expect-error body has to exist in order for this event to have happened
            if (ev.other.body?.collisionType === CollisionType.Passive) {
                this.passives.delete(ev.other.owner)
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