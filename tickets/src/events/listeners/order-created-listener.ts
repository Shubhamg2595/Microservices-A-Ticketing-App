import { Listener, OrderCreatedEvent, Subjects } from "@msgtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    //    find the ticket, order service has reserved
    const { ticket } = data;

    const existingTicket = await Ticket.findById(ticket.id);
    // throw error it it does not exist
    if (!existingTicket) {
      throw new Error("Ticket not found");
    }

    // mark the ticket as reserved, by setting orderId
    const { id: orderId } = data;

    existingTicket.set({ orderId });

    // save ticket
    await existingTicket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: existingTicket.id,
      version: existingTicket.version,
      title: existingTicket.title,
      price: existingTicket.price,
      userId: existingTicket.userId,
      orderId: existingTicket.orderId,
    });

    // ack the message

    msg.ack();
  }
}
