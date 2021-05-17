import { Listener, OrderCancelledEvent, Subjects } from "@msgtickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
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

    existingTicket.set({ orderId: null });
    await existingTicket.save();

    msg.ack();
  }
}
