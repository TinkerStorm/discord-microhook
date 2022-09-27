// Local classes
import { Emoji } from "./Emoji";
import { Message } from "./Message";

// Local types
import type { ReactionData } from "../util/types.common";

export class Reaction {
  /**
   * The message that the reaction belongs to.
   * @private
   * @hidden
   */
  private readonly _message: Message;

  /** The emoji that was reacted with. */
  emoji: Emoji;
  /** The amount of times the emoji was reacted with. */
  count: number;
  /**
   * Whether the current user reacted with the emoji.
   * *Would always be false for user-owned webhooks - don't know if applicable for bot-owned webhooks.*
   */
  me: boolean;

  constructor(message: Message, data: ReactionData) {
    this._message = message;

    this.emoji = new Emoji(data.emoji);
    this.count = data.count;
    this.me = data.me;
  }
}
