import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post request", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns anything but 401 if user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is given", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "",
      price: 34,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({
      price: 34,
    })
    .expect(400);
});

it("returns an error if an invalid price is given", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "some title",
      price: -123,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "some title again",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find();

  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "some product",
      price: 100,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(100);
});

it("publishes an event", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "some product",
      price: 100,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
