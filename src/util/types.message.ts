// #region Imports

// Local types
import type { Snowflake, UserData } from "./types.common";
import type { ComponentRow } from "./types.components";
import type { Embed, EmbedOptions } from "./types.embed";
import type { PartialWebhookMessageOptions } from "./types.webhook";

// #endregion

export type MessageData = {
  application_id?: string;
  attachments: AttachmentData[];
  author: UserData;
  channel_id: Snowflake;
  edited_timestamp: string | undefined;
  embeds: Embed[];
  id: Snowflake;
  mentions: UserData[];
  mentions_roles: string[];
  mention_everyone: boolean;
  pinned?: boolean;
  position?: number;
  timestamp: string;
  // type: MessageType;
  webhook_id?: string;
} & SharedMessageData;

export type MessageOptions = EditMessageOptions &
  RequiredMessageOptionsUnion &
  Partial<PartialWebhookMessageOptions> &
  Partial<ThreadLikeTarget | { thread_name?: string }>;

export type EditMessageOptions = Partial<BaseMessageOptions>;

export type BaseMessageOptions = {
  allowed_mentions: Partial<AllowedMentions>;
  embeds: EmbedOptions[];
  files: FileAttachment[];
  suppressEmbeds?: boolean;
} & SharedMessageData &
  Partial<ThreadLikeTarget>;

export type ThreadLikeTarget = { threadID: string };

// Wait & thread_id are on query string
export type SharedMessageData = {
  content: string;
  components: ComponentRow[];
  attachments: AttachmentOptions[];
  tts: boolean;
  flags?: MessageFlags;
};

/** A series of fields for a message, one of which must be filled out. */
export type RequiredMessageOptionsUnion =
  | { content: string }
  | { embeds: EmbedOptions[] }
  | { files: FileAttachment[] };

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
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8,
}

export type AttachmentData = {
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
} & AttachmentOptions;

export type AttachmentOptions = {
  id: string | number;
  description?: string;
};

export type FileAttachment = {
  name: string;
  file: Buffer;
};

export type AllowedMentions = {
  parse: AllowedMentionType[];
  roles: Snowflake[];
  users: Snowflake[];
  replied_user: boolean;
};

export enum AllowedMentionType {
  ROLES = "roles",
  USERS = "users",
  EVERYONE = "everyone",
}
