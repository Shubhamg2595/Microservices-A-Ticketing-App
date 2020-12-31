import mongoose from "mongoose";
import { app } from "./app";

const startDB = async () => {
  // need to connect to our pod in k8s via clusterIp
  try {
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY must be defined");
    }

    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("DB connected");
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000...");
  });
};

startDB();
