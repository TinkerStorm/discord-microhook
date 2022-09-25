import { Snowflake, UserData } from "./types.common";
import { ComponentRow } from "./types.components";
import { Embed, EmbedOptions } from "./types.embed";
import { PartialWebhookMessageOptions } from "./types.webhook";

export interface MessageData extends SharedMessageData {
  application_id?: string;
  attachments: AttachmentData[];
  author: UserData;
  channel_id: Snowflake;
  edited_timestamp: string | null;
	embeds: Embed[];
  id: Snowflake;
  mentions: UserData[];
  mention_everyone: boolean;
  pinned: boolean;
  position?: number;
  timestamp: string;
  type: MessageType;
  webhook_id?: string;
}

export type MessageOptions = EditMessageOptions & RequiredMessageOptionsUnion & PartialWebhookMessageOptions;

export type EditMessageOptions = Partial<BaseMessageOptions>;

export interface BaseMessageOptions extends SharedMessageData {
	allowed_mentions: Partial<AllowedMentions>;
  embeds: EmbedOptions[];
  files: FileAttachment[];
  suppressEmbeds?: boolean;
}

// wait & thread_id are on query string
export interface SharedMessageData {
	content: string;
  components: ComponentRow[];
  attachments: AttachmentOptions[];
	tts: boolean;
  flags?: MessageFlags;
};

type RequiredMessageOptionsUnion = {content: string} | {embeds: Embed[]} | {files: FileAttachment[]};

export enum MessageType {

}

/**
 * Only `SUPPRESS_EMBEDS` is supported in MessageOptions#flags
 * @see https://discord.dev/resources/channel#message-object-message-flags
 */
export enum MessageFlags {
  // This message has been published to subscribed channels (via Channel Following)
  CROSSPOSTED = 1 << 0,
  // Do not include any embeds when serializing this message
  SUPPRESS_EMBEDS = 1 << 2,
  HAS_THREAD = 1 << 5,
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8
};

export interface AttachmentData extends AttachmentOptions {
  /** The attachment id. */
  id: Snowflake;
  /** The name of the file attached. */
  filename: string;
  /**
   * The attachment's media type.
   * @see https://en.wikipedia.org/wiki/Media_type
   */
  content_type?: string;
  /** The size of the file in bytes. */
  size: number;
  /** The source URL of the file. */
  url: string;
  /** A proxied URL of the file. */
  proxy_url: string;

  /** Height of file (if image). */
  height?: number;
  /** Width of file (if image). */
  width?: number;
}

export interface AttachmentOptions {
  id: string | number;
  description?: string;
}

export interface FileAttachment {
  name: string;
  file: Buffer;
}

export interface AllowedMentions {
  parse: AllowedMentionType[];
  roles: Snowflake[];
  users: Snowflake[];
  replied_user: boolean;
}

export enum AllowedMentionType {
  ROLES = "roles",
  USERS = "users",
  EVERYONE = "everyone"
}