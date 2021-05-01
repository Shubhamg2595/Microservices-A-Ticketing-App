import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import { errorHandler, NotFoundError, currentUser } from "@msgtickets/common";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";

const app = express();

app.use(json());

app.set("trust proxy", true); // since traffic is coming from proxy i.e ingress engine, we need to tell express to allow http-connections from proxies.
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test", //making sure only http requests are entertained when environment is not set to test mode
  })
);

app.use(currentUser);

app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
