// #region Imports

// Local constants
import { ROUTER } from "../util/constants";

// Local types
import type { AvatarSize, EmojiData, Snowflake } from "../util/types.common";

// #endregion

/** Represents a Discord emoji. */
export class Emoji {
  /** The ID of the emoji. - Custom emojis only. */
  id?: Snowflake;
  /** The name of the emoji. - Unicode if built-in. */
  name: string;
  /** Whether the emoji is animated. - Custom emojis only. */
  animated?: boolean;

  constructor(emoji: EmojiData) {
    this.id = emoji.id;
    this.name = emoji.name;
    this.animated = emoji.animated;
  }

  get url() {
    if (!this.id) return null;

    const format = this.animated ? "gif" : "png";

    return ROUTER.cdn.emoji(this.id, format);
  }

  dynamicURL(size: AvatarSize = 128): string | null {
    if (this.url) return this.url + `?size=${size}`;

    return null;
  }
}
