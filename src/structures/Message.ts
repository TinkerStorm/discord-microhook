// #region Imports

// Local classes
import { User } from "./User";
import type { Webhook } from "./Webhook";

// Local types
import type { UserData } from "../util/types.common";
import type { ComponentRow } from "../util/types.components";
import type { Embed } from "../util/types.embed";
import type {
  AttachmentData,
  EditMessageOptions,
  MessageData,
  MessageFlags,
} from "../util/types.message";

// #endregion

export class Message {
  readonly _webhook: Webhook;

  /** The ID of the message. */
  readonly id: string;
  /** The author of the message. */
  readonly author: User;
  /** If the webhook is application-owned, this will return the application's ID. */
  readonly applicationID?: string;
  /** File attachments on the message. */
  attachments?: AttachmentData[];
  /**
   * The channel this message belongs to.
   * * Text
   * * Voice
   * * News
   * * Thread
   *
   * *Webhooks do not have enough information to determine the channel type by themselves.*
   */
  readonly channelID: string;
  /** Attached message components */
  components?: ComponentRow[];
  /** String content of the message. */
  content?: string;
  /** When the message was edited. (null if never) */
  editedTimestamp?: string;
  /** Embeds attached to the message. */
  embeds?: Embed[];
  /** Message flags bitfield. */
  flags?: MessageFlags;
  /** Is this message pinned? (Applies to all channel types). */
  pinned?: boolean;
  /** Any user entries that were mentioned in the message (sent from Discord). */
  mentions?: User[];
  /** Any roles that were mentioned in the message (sent from Discord). */
  mentionsRoles?: string[];
  /** Whether this message mentions everyone. */
  mentionEveryone?: boolean;
  /** (Forum Post / Public Thread) Approximate position of message entry in a thread. */
  position?: number;
  /** When the message was created. */
  readonly timestamp: string;
  /** Whether the message was sent with text-to-speech enabled. */
  tts: boolean;
  // readonly type: MessageType;
  /** The webhook that sent the message. */
  webhookID?: string;

  constructor(webhook: Webhook, data: MessageData) {
    this._webhook = webhook;

    this.id = data.id;

    this.author = new User(this._webhook, data.author);
    this.channelID = data.channel_id;
    this.timestamp = data.timestamp;
    // this.type = data.type;
    this.tts = data.tts;
    this.webhookID = data.webhook_id;

    this._patch(data);
  }

  /** @hidden */
  _patch(data: Message | MessageData) {
    if (data instanceof Message) {
      if (this.editedTimestamp !== data.editedTimestamp) {
        this.editedTimestamp = data.editedTimestamp;
      }

      if (this.mentionEveryone !== data.mentionEveryone) {
        this.mentionEveryone = data.mentionEveryone;
      }

      this.mentions = data.mentions;

      this.mentionsRoles = data.mentionsRoles;
    } else {
      if (data.edited_timestamp) {
        this.editedTimestamp = data.edited_timestamp;
      }

      if (data.mention_everyone) {
        this.mentionEveryone = data.mention_everyone;
      }

      if (data.webhook_id) {
        this.webhookID = data.webhook_id;
      }

      if (data.mentions) {
        this.mentions = data.mentions.map(
          (mention: UserData) => new User(this._webhook, mention)
        );
      }

      if (data.mentions_roles) {
        this.mentionsRoles = data.mentions_roles;
      }
    }

    if (data.attachments) {
      this.attachments = data.attachments;
    }

    if (data.content) {
      this.content = data.content;
    }

    if (data.embeds) {
      this.embeds = data.embeds;
    }

    if (data.pinned) {
      this.pinned = data.pinned;
    }

    if (data.position) {
      this.position = data.position;
    }

    if (data.tts) {
      this.tts = data.tts;
    }
  }

  /** @hidden */
  #destroy() {
    // Unknown, unref to dispose of
  }

  async fetch(): Promise<Message> {
    const data = await this._webhook.fetchMessage(this.id);

    this._patch(data);

    return this;
  }

  /** */
  async edit(
    content: string | EditMessageOptions,
    options: EditMessageOptions
  ): Promise<Message> {
    const data = await this._webhook.editMessage(this.id, content, options);

    this._patch(data);

    return data;
  }

  /**
   * Removes the message, uses the channelID to target the thread... if it is in one.
   * @returns void
   */
  async delete(): Promise<void> {
    this._webhook.deleteMessage(this.id, this.channelID);
    this.#destroy();
  }
}
