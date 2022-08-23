import { Webhook } from "./Webhook";

export class Message {
  constructor(private webhook: Webhook, message: MessageData) {
    this.id = message.id;
  }

  edit(options) {
    this.webhook.editMessage();
  }

  delete() {
    this.webhook.deleteMessage();
  }
}