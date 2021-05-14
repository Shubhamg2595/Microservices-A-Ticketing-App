import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.getAuthCookie())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticketis already reserved", async () => {
  const ticket = Ticket.build({
    title: "fake ticket",
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "asdsadjasda",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket. ", async () => {
  const ticket = Ticket.build({
    title: "fake ticket",
    price: 20,
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order created event. ", async () => {
  const ticket = Ticket.build({
    title: "fake ticket",
    price: 20,
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
