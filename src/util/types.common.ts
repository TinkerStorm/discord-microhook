export interface Emoji {
  name: string;
  id?: string;
  animated?: boolean;
}

export type Snowflake = string;

export interface UserData {
  avatar?: string;
  bot: boolean;
  discriminator: string;
  id: Snowflake;
  username: string;
  /** *Not described in API documentation, but appears in user mentions within `MessageData`.* */
  avatar_decoration?: string;
  /**
   * The public flags on a user's account.
   * @see https://discord.dev/resources/user#user-object-user-flags
   */
  public_flags: UserFlags;
}

/** A selection of user flags - only includes flags that are relevant to the library. */
export enum UserFlags {
  STAFF = 1 << 0,
  PARTNER = 1 << 1,
  HYPESQUAD = 1 << 2,
  BUG_HUNTER = 1 << 3,
  HYPESQUAD_BRAVERY = 1 << 6,
  HYPESQUAD_BRILLIANCE = 1 << 7,
  HYPESQUAD_BALANCE = 1 << 8,
  EARLY_SUPPORTER = 1 << 9,
  BUG_HUNTER_LEVEL_2 = 1 << 14,
  VERIFIED_BOT = 1 << 16,
  EARLY_VERIFIED_BOT_DEVELOPER = 1 << 17,
  DISCORD_CERTIFIED_MODERATOR = 1 << 18,
  BOT_HTTP_INTERACTIONS = 1 << 19
}

export type AvatarSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export type ImageFormat = 'png' | 'jpg' | 'webp' | 'gif' | 'json';