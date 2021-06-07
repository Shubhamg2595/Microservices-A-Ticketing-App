import { OrderStatus } from "@msgtickets/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Payment } from "../../models/charge";
import { Order } from "../../models/order";
import { stripe } from "../../stripe";

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

it("returns a 204 with valid inputs", async () => {
  const uniqueUserId = mongoose.Types.ObjectId().toHexString();
  const authCookie = global.getAuthCookie(uniqueUserId);
  const price = Math.floor(Math.random() * 10000)
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: price,
    status: OrderStatus.Created,
    version: 1,
    userId: uniqueUserId,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", authCookie)
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);

    const stripeChargeList = await stripe.charges.list({
      limit: 50,
    });
    const stripeCharge = stripeChargeList.data.find((charge) => {
      return charge.amount === price;
    });
  
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.amount).toEqual(price);
});

it("testing payments service", async () => {
  const uniqueUserId = mongoose.Types.ObjectId().toHexString();
  const authCookie = global.getAuthCookie(uniqueUserId);
  const price = Math.floor(Math.random() * 10000)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: price,
    status: OrderStatus.Created,
    version: 1,
    userId: uniqueUserId,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", authCookie)
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);

  const stripeChargeList = await stripe.charges.list({
    limit: 50,
  });
  const stripeCharge = stripeChargeList.data.find((charge) => {
    return charge.amount === price;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.amount).toEqual(price);

  // testing payment creation

  // this test will only work, when we use Real test implementation, not the old one.
  const payment = Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});
