import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/siginin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler, NotFoundError } from "@msgtickets/common";

const app = express();

app.use(json());

app.set("trust proxy", true); // since traffic is coming from proxy i.e ingress engine, we need to tell express to allow http-connections from proxies.
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test", //making sure only http requests are entertained when environment is not set to test mode
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signUpRouter);
app.use(signOutRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
