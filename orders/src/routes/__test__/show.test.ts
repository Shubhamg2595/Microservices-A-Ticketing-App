import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("fetches the order", async () => {
  // create a ticket

  const ticket = await Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),

    title: "fake ticket",
    price: 20,
  });
  await ticket.save();

  const user = global.getAuthCookie();
  // make a request to create an order for this ticket

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch this particular order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another user's orders", async () => {
  // create a ticket

  const ticket = await Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),

    title: "fake ticket",
    price: 20,
  });
  await ticket.save();

  const user = global.getAuthCookie();

  // make a request to create an order for this ticket

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch this particular order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.getAuthCookie())
    .send()
    .expect(401);
});
