import mongoose from "mongoose";

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

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// adding custom functions to mongoose schema objects
userSchema.statics.build = (attrs: IUserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<IUserDoc , IUserModel>("User", userSchema);


export { User };
