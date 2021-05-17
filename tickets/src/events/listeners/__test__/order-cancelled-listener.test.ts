import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent, OrderStatus } from "@msgtickets/common";
import mongoose from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  // initialize listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create ticket and save it
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "fake title",
    price: 123,
    userId: mongoose.Types.ObjectId().toHexString(),
  });
  ticket.orderId = orderId;
  await ticket.save();

  // create fake orderCancelled data event
  const data: OrderCancelledEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 1,
    ticket: {
      id: ticket.id,
    },
  };

  // create a fake msg object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg, orderId };
};

it("sets orderID of the ticket as undefined", async () => {
  const { data, listener, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined();
});

it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes an TicketUpdated event", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  // need to test whether our mock [__mocks__]natsWrapper's publish() is called with appropriate params or not
  expect(natsWrapper.client.publish).toHaveBeenCalled();

});
