// Local Imports (Constants)
import { ROUTER } from "../util/constants";

// Local Imports (Types)
import type { AvatarSize, ImageFormat, UserData, UserFlags } from "../util/types.common";

export class User {
  avatar?: string;
  avatarDecoration?: string;
  bot: boolean;
  discriminator: string;
  id: string;
  username: string;
  publicFlags?: UserFlags;

  constructor(user: UserData) {
    if (user.avatar) this.avatar = user.avatar;
    this.bot = user.bot;
    this.discriminator = user.discriminator;
    this.id = user.id;
    this.username = user.username;
    if (user.public_flags) this.publicFlags = user.public_flags;
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
    if (!this.avatar) return this.defaultAvatarURL;

    const format = this.avatar.startsWith("a_") ? "gif" : "png";

    return ROUTER.cdn.avatar(this.id, this.avatar, format);
  }

  get defaultAvatarURL() {
    return ROUTER.cdn.defaultAvatar(Number(this.discriminator) % 5);
  }

  dynamicAvatarURL(format: ImageFormat, size: AvatarSize) {
    if (!this.avatar) return this.defaultAvatarURL;

    if (this.avatar.startsWith("a_")) format = "gif";

    return ROUTER.cdn.avatar(this.id, this.avatar, format, size);
  }

  toString() {
    return `${this.tag} (${this.id})`;
  }
}