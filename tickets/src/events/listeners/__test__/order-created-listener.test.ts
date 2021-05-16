import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@msgtickets/common";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";

const setup = async () => {
  // create listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create ticket and save it
  const ticket = Ticket.build({
    title: "fake title",
    price: 123,
    userId: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  //   create fake event data

  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: "339",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // create a fake msg object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets orderID of the ticket", async () => {
  const { data, msg, listener, ticket } = await setup();

  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
