import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from "@msgtickets/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/charge";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order.");
    }

    const charges = await stripe.charges.create({
      currency: "inr",
      amount: order.price,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charges.id,
    });
    await payment.save();

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
