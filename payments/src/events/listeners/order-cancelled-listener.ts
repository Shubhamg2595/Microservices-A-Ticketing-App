import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@msgtickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const orderInProcess = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!orderInProcess) {
      throw new Error("Order not found!");
    }

    orderInProcess.set({
      status: OrderStatus.Cancelled,
    });

    await orderInProcess.save();

    msg.ack();
  }
}
