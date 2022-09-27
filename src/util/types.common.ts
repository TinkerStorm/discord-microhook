export interface EmojiData {
  name: string;
  id?: string;
  animated?: boolean;
}

export interface ReactionData {
  count: number;
  emoji: EmojiData;
  me: boolean;
}

export type Snowflake = string;

export interface UserData {
  /** The user's avatar */
  avatar?: string;
  /** Whether the user belongs to an OAuth2 application */
  bot: boolean;
  /** The discriminator for the user */
  discriminator: string;
  /** The ID for the user. */
  id: Snowflake;
  /** The username for the user. */
  username: string;
  /** *Not described in API documentation, but appears in user mentions within `MessageData`.* */
  avatar_decoration?: string;
  /**
   * The public flags on a user's account.
   * @see https://discord.dev/resources/user#user-object-user-flags
   */
  public_flags?: UserFlags;
}

/** A selection of user flags - only includes flags that are relevant to the library. */
export enum UserFlags {
  STAFF = 1,
  PARTNER = 2,
  HYPESQUAD = 4,
  BUG_HUNTER = 8,
  HYPESQUAD_BRAVERY = 64,
  HYPESQUAD_BRILLIANCE = 128,
  HYPESQUAD_BALANCE = 256,
  EARLY_SUPPORTER = 512,
  BUG_HUNTER_LEVEL_2 = 16384,
  VERIFIED_BOT = 65536,
  EARLY_VERIFIED_BOT_DEVELOPER = 131072,
  DISCORD_CERTIFIED_MODERATOR = 262144,
  BOT_HTTP_INTERACTIONS = 524288,
}

export type AvatarSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export type ImageFormat = "png" | "jpg" | "webp" | "gif" | "json";
