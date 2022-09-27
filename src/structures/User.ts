// Local classes
import { Webhook } from "./Webhook";

// Local constants & types
import { ROUTER } from "../util/constants";
import type {
  AvatarSize,
  ImageFormat,
  UserData,
  UserFlags,
} from "../util/types.common";

/**
 * Represents a Discord user.
 *
 * Webhooks *sometimes* have enough information to determine what type of user the data represents (`~#publicFlags`, `~#avatarDecoration`).
 */
export class User {
  /** The avatar of the user. */
  avatar?: string;
  /** The avatar decoration of the user (available for user mentions). */
  avatarDecoration?: string;
  /** Whether the user is a bot. */
  bot: boolean;
  /** The discriminator of the user. */
  discriminator: string;
  /** The ID of the user. */
  id: string;
  /** The username of the user. */
  username: string;
  /** The public flags that the user has. */
  publicFlags?: UserFlags;

  constructor(private readonly webhook: Webhook, user: UserData) {
    // Guaranteed data fields
    this.bot = user.bot;
    this.discriminator = user.discriminator;
    this.id = user.id;
    this.username = user.username;

    // Optional (or null) data fields
    if (user.avatar) {
      this.avatar = user.avatar;
    }

    if (user.public_flags) {
      this.publicFlags = user.public_flags;
    }

    if (user.avatar_decoration) {
      this.avatarDecoration = user.avatar_decoration;
    }
  }

  /**
   * The tag of the user.
   */
  get tag() {
    return `${this.username}#${this.discriminator}`;
  }

  /**
   * The mention of the user.
   */
  get mention() {
    return `<@${this.id}>`;
  }

  get avatarURL() {
    if (!this.avatar) {
      return this.defaultAvatarURL;
    }

    const format = this.avatar.startsWith("a_") ? "gif" : "png";

    return ROUTER.cdn.avatar(this.id, this.avatar, format);
  }

  get defaultAvatarURL() {
    return ROUTER.cdn.defaultAvatar(Number(this.discriminator) % 5);
  }

  dynamicAvatarURL(format: ImageFormat, size: AvatarSize) {
    if (!this.avatar) {
      return this.defaultAvatarURL;
    }

    if (this.avatar.startsWith("a_")) {
      format = "gif";
    }

    return ROUTER.cdn.avatar(this.id, this.avatar, format, size);
  }

  toString() {
    return `${this.tag} (${this.id})`;
  }
}
