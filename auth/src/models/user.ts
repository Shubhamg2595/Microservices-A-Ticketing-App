import mongoose from "mongoose";

interface IUserAttrs {
  email: String;
  password: String;
}

// interface to describe props that a User model will have

interface IUserModel extends mongoose.Model<any> {
  build(attrs: IUserAttrs): any;
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

const User = mongoose.model<any, IUserModel>("User", userSchema);

export { User };
