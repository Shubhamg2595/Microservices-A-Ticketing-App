import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events";
console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(stan);

  const data = {
    id: "123",
    title: "my ticket",
    price: 30,
  };

  try {
    await publisher.publish(data);
  } catch (error) {
    console.log(error);
  }
});
