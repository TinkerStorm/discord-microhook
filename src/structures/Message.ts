// Local classes
import { User } from "./User";
import { Webhook } from "./Webhook";

// Local Types
import { UserData } from "../util/types.common";
import { ComponentRow } from "../util/types.components";
import { Embed } from "../util/types.embed";
import { AttachmentData, EditMessageOptions, MessageData, MessageFlags, MessageType } from "../util/types.message";

export class Message {
  /** The ID of the message. */
  readonly id: string;

  /** */
  readonly author: User;
  /** */
  readonly applicationID?: string;
  /** */
  attachments?: AttachmentData[];
  /** */
  readonly channelID: string;
  /** */
  components?: ComponentRow[];
  /** */
  content?: string;
  /** */
  editedTimestamp?: string;
  /** */
  embeds?: Embed[];
  /** */
  flags?: MessageFlags;
  /** */
  pinned?: boolean;
  /** */
  mentionEveryone?: boolean;
  /** */
  position?: number;
  /** */
  mentions?: User[];
  /** */
  readonly timestamp: string;
  /** */
  tts: boolean;
  /** The type of message. */
  readonly type: MessageType;
  /** */
  webhookID?: string;
  
  /** */
  constructor(private webhook: Webhook, data: MessageData) {
    this.id = data.id;

    this.author = new User(data.author);
    this.channelID = data.channel_id;
    this.timestamp = data.timestamp;
    this.type = data.type;
    this.tts = data.tts;
    this.webhookID = data.webhook_id;

    this.#patch(data);
  }

  /** @hidden */
  #patch(data: Message | MessageData) {
    if (data instanceof Message) {
      if (this.editedTimestamp !== data.editedTimestamp)
        this.editedTimestamp = data.editedTimestamp;
      if (this.mentionEveryone !== data.mentionEveryone)
        this.mentionEveryone = data.mentionEveryone;
      
      this.mentions = data.mentions;
    } else {
      if (data.edited_timestamp) this.editedTimestamp = data.edited_timestamp;
      if (data.mention_everyone) this.mentionEveryone = data.mention_everyone;
      if (data.webhook_id) this.webhookID = data.webhook_id;
      if (data.mentions) this.mentions = data.mentions.map((mention: UserData) => new User(mention));
    }

    if (data.attachments) this.attachments = data.attachments;
    if (data.content) this.content = data.content;
    if (data.embeds) this.embeds = data.embeds;
    if (data.pinned) this.pinned = data.pinned;
    if (data.position) this.position = data.position;
    if (data.tts) this.tts = data.tts;
  }

  
  /** @hidden */
  #destroy() {
    // Unknown, unref to dispose of
  }

  async fetch(): Promise<Message> {
    const data = await this.webhook.fetchMessage(this.id);

    this.#patch(data);

    return this;
  }

  /** */
  async edit(content: string | EditMessageOptions, options: EditMessageOptions): Promise<Message> {
    const data = await this.webhook.editMessage(this.id, content, options);

    this.#patch(data);

    return data;
  }

  /**
   * Removes the message, uses the channelID to target the thread... if it is in one.
   * @returns void
   */
  async delete(): Promise<void> {
    this.webhook.deleteMessage(this.id, this.channelID);
    this.#destroy();
  }
}