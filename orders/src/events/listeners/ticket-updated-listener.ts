import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@msgtickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent(data)

    if (!ticket) {
      throw new Error("Ticket Not found"); // will be handled better
    }

    const { title, price } = data;

    ticket.set({ title, price });

    await ticket.save();

    msg.ack();
  }
}
