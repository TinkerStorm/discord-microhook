import { MessageOptions } from "../util/types";
import { Webhook } from "./Webhook";

export class Message {
  id: string;

  constructor(private webhook: Webhook, message: MessageData) {
    this.id = message.id;
  }

  async edit(options: MessageOptions): Promise<Message> {
    return this.webhook.editMessage(this.id, options);
  }

  async delete(reason?: string): Promise<void> {
    return this.webhook.deleteMessage(this.id, reason);
  }
}