import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";
it("cancels an order", async () => {
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

  // make request to cancel this order
  //   const { body: fetchedOrder } =
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
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

  // make request to cancel this order
  //   const { body: fetchedOrder } =
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
