import mongoose from "mongoose";

interface IPaymentAttrs {
  orderId: string;
  stripeId: string; // refers to chargeID in relation to a orderId
}

interface IPaymentDocument extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface IPaymentMODEL extends mongoose.Model<IPaymentDocument> {
  build(attrs: IPaymentAttrs): IPaymentDocument;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: IPaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<IPaymentDocument, IPaymentMODEL>(
  "Payment",
  paymentSchema
);

export { Payment };
