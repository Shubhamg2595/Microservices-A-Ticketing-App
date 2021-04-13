import nats from "node-nats-streaming";
console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  //   All data being sent to the nats server must be in string format'

  const data = JSON.stringify({
    id: "123",
    title: "my ticket",
    price: 30,
  });

  // publish(channelName,payload, callBackFn)

  stan.publish("ticket:created", data, () => {
    console.log("Event published.");
  });
});
