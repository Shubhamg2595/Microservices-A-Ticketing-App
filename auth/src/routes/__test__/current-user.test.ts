import request from "supertest";
import { app } from "../../app";

it("responds with details about current user", async () => {
  // easy solution to transfer cookie to next request

  const cookie = await global.getAuthCookie();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  console.log("response.body::::", response.body);

  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
