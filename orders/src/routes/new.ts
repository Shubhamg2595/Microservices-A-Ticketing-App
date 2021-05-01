import express, { Request, Response } from "express";
import {requireAuth,validateRequest} from '@msgtickets/common'
import {body} from 'express-validator'
const router = express.Router();

router.get("/api/orders/:orderId",requireAuth, [

  body('ticketId')
    .not()
    .isEmpty()
    .withMessage('TickedID must be provided.')

], async (req: Request, res: Response) => {
  res.send({});
});

export { router as newOrderRouter };
