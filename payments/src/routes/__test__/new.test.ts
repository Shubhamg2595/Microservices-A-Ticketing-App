import { OrderStatus } from "@msgtickets/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";

it("returns a 404 when purchasing a non-existent order.", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getAuthCookie())
    .send({
      orderId: mongoose.Types.ObjectId().toHexString(),
      token: "asdsadsa",
    })
    .expect(404);
});

it("returns a 401, when user makes payment for order, that does not belong to them ", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 40,
    status: OrderStatus.AwaitingPayment,
    version: 1,
    userId: mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.getAuthCookie())
    .send({
      orderId: order.id,
      token: "asdsadsa",
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const uniqueUserId = mongoose.Types.ObjectId().toHexString();
  const authCookie = global.getAuthCookie(uniqueUserId);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 40,
    status: OrderStatus.Cancelled,
    version: 1,
    userId: uniqueUserId,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", authCookie)
    .send({
      orderId: order.id,
      token: "asdsadsa",
    })
    .expect(400);
});
