import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(): string[];
    }
  }
}

let mongo: any;
beforeAll(async () => {
  // basic way of adding env-variable for test setup

  process.env.JWT_KEY = "asdfasd";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // resetting all mongoDB instances
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// after performing all testing, stopping mongo server

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// only accessiblt to testing code

global.getAuthCookie = () => {
  //  building a jwt payload containing id and email

  const payload = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: "est@est.com",
  };

  // create the JWT

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build the session object {jwt: JWT_KEY}

  const session = { jwt: token };

  // turn that session object to json

  const sessionJSON = JSON.stringify(session);

  // take JSON and encode it into base64

  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};
