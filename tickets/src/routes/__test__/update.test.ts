import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
it("returns a 404 if the provided id does not exist", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "asdasdasd",
      price: 34,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "asdasdasd",
      price: 34,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "asdad",
      price: 23,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.getAuthCookie())
    .send({
      title: "asdsad",
      price: 4133,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const authCookie = global.getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", authCookie)
    .send({
      title: "asdad",
      price: 23,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", authCookie)
    .send({
      title: "",
      price: 4133,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", authCookie)
    .send({
      title: "sadasdasd",
      price: -4133,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const authCookie = global.getAuthCookie();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", authCookie)
    .send({
      title: "asdad",
      price: 23,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", authCookie)
    .send({
      title: "sadasdasd",
      price: 4133,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("sadasdasd");
});
