import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(): Promise<string[]>;
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

global.getAuthCookie = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password
    })
    .expect(201);

  const cookie = response.get("Set-Cookie");

  return cookie;
};
