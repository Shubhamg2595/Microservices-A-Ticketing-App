import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: "fake ticket",
    price: 20,
    userId: "222",
  });

  // save the ticket to DB

  await ticket.save();

  // fetch the same ticket twice to check if it has version field

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make 2 separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 14 });

  // save the first fetched ticket

  await firstInstance!.save();

  // SAVE THE SECOND FETCHED TICKET : will have an outdated version number,hence previous save() will update the version number. hence expecting to throw an error here

  await expect(secondInstance!.save()).rejects.toThrow();
});

it("increments the ticket version on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "fake ticket",
    price: 20,
    userId: "222",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
