import mongoose from "mongoose";
import Password from "../services/password";

interface IUserAttrs {
  email: String;
  password: String;
}

// interface to describe props that a User model will have

interface IUserModel extends mongoose.Model<IUserDoc> {
  build(attrs: IUserAttrs): IUserDoc;
}

// interface that describes props that a user doc. will have.
interface IUserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

//middleware fn provided by mongoose which is executed before a document is saved in collection

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    // email change func
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// adding custom functions to mongoose schema objects
userSchema.statics.build = (attrs: IUserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<IUserDoc, IUserModel>("User", userSchema);

export { User };
