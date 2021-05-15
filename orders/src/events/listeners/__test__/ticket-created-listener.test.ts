import { TicketCreatedEvent } from "@msgtickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of listener

  const listener = new TicketCreatedListener(natsWrapper.client);
  // create fake data event
  const data: TicketCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "fake title",
    price: 123,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake msg object
  //   @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("create and save a ticket", async () => {
  // call the onMessage function with fake data and msg object

  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  // write assertions to check a ticket was created.

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
});

it("acknowledges the message", async () => {
  // call the onMessage function with fake data and msg object

  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  // write assertions to check msg is acknowledged

  expect(msg.ack).toHaveBeenCalled();
});
