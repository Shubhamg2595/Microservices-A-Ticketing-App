import { Listener, OrderCancelledEvent, Subjects } from "@msgtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const { ticket } = data;
    const existingTicket = await Ticket.findById(ticket.id);
    if (!existingTicket) {
      throw new Error("Ticket not found !");
    }

    // only using undefined is to support TS optional property.

    existingTicket.set({ orderId: undefined });
    await existingTicket.save();

    
    await new TicketUpdatedPublisher(this.client).publish({
      id: existingTicket.id,
      version: existingTicket.version,
      title: existingTicket.title,
      price: existingTicket.price,
      userId: existingTicket.userId,
      orderId: existingTicket.orderId,
    });


    msg.ack();
  }
}
