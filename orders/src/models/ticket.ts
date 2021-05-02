import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";
interface TicketAttrs {
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<Boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

// reason for using anonymous function here, is bcoz an arrow function will mess with value of "this" in the function

// return error, if ticket not found , that will mean ticket is already reserved
// run query to look at all orders and find an order which contains our mentioned ticket and its order status is not cancelled. If we find such a order in ORders DN, that means that ticket is reserved.

ticketSchema.methods.isReserved = async function () {
  // this => the ticket document we just called 'isReserved' on

  const existingOrder = await Order.findOne({
    ticket: this.id,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
  // if existingOrder === null , !null => true =? !true =>  false
};
const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
