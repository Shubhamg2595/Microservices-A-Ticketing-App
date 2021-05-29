import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@msgtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
