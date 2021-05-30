import { ExpirationCompleteEvent, OrderStatus } from "@msgtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";
import { ExpirationCmpleteListener } from "../expiration-complete-listener";

const setup = async () => {
  // create an instance of listener

  const listener = new ExpirationCmpleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "fake ticket",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: "soeRandomUserId",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  // create fake data event
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // create a fake msg object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it("upates the order status to be cancelled", async () => {
  // call the onMessage function with fake data and msg object

  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // write assertions to check a ticket was created.

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelled event", async () => {
  // call the onMessage function with fake data and msg object

  const { data, listener, order, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  /**
   * calls : array of all the different times, this function was invoked.
   * [0][0] : contains the subject
   * [0][1] : contains the data object
   */

  const parsedOrderCancelledEventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(order.id).toEqual(parsedOrderCancelledEventData.id);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
