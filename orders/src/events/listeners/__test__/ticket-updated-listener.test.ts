import { TicketUpdatedEvent } from "@msgtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  // create an instance of listener

  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "fake title",
    price: 123,
  });
  await ticket.save();

  // create fake data event
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "fake updatedTitle",
    price: 1314,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake msg object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("finds , updates and save a ticket", async () => {
  // call the onMessage function with fake data and msg object

  const { data, listener, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);

  expect(updatedTicket!.version).toEqual(data.version);
});

it("acknowledges the message", async () => {
  // call the onMessage function with fake data and msg object

  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  // write assertions to check msg is acknowledged

  expect(msg.ack).toHaveBeenCalled();
});
