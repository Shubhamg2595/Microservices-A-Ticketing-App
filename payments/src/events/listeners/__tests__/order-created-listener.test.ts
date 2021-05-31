import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { OrderCreatedEvent, OrderStatus } from "@msgtickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";

const setup = async () => {
  // create listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //   create fake event data
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: "adasd",
    ticket: {
      id: "asdsadsahd",
      price: 230,
    },
  };

  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { data, msg, listener } = await setup();

  await listener.onMessage(data, msg);

  const replicatedOrder = await Order.findById(data.id);

  expect(replicatedOrder!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
