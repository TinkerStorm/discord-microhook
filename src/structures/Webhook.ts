// Node Imports
import EventEmitter from "node:events";

// Local classes
import { Message } from "./Message";
import { RequestHandler } from "../rest/handler";

// Local constants & types
import { BASE_URL, ROUTER } from "../util/constants";
import { MessageFlags, type ThreadLikeTarget } from "../util/types.message";
import type {
  EditWebhookOptions,
  WebhookData,
  WebhookOptions,
} from "../util/types.webhook";
import type {
  EditMessageOptions,
  MessageData,
  MessageOptions,
} from "../util/types.message";

export class Webhook extends EventEmitter {
  // Protected cache: Map<string, Message> = new Map();
  /** @hidden */
  protected requestHandler: RequestHandler;

  public options: WebhookOptions;

  public id: string;
  public token: string;

  public applicationID?: string;
  public avatar?: string;
  public channelID?: string;
  public guildID?: string;
  public name?: string;

  static from(
    target: URL | string,
    options?: Omit<WebhookOptions, "id" | "token">
  ): Webhook {
    if (!(target instanceof URL)) {
      target = new URL(target);
    }

    if (!options) options = {};

    const urlValidation =
      target.protocol === "https:" &&
      target.hostname === "discord.com" &&
      (target.pathname.startsWith("/api/webhooks/") ||
        target.pathname.startsWith(`${BASE_URL}/webhooks`));

    if (!urlValidation) {
      throw new Error("Invalid webhook URL");
    }

    const [token, id] = target.pathname.split("/").reverse();

    return new Webhook({ ...options, id, token });
  }

  constructor(options: WebhookOptions) {
    // Ensure presence of required options
    if (!options.id || !options.token) {
      throw new Error("Webhook ID and token are required");
    }

    super();

    this.id = options.id;
    this.token = options.token;

    this.options = {
      autoFetch: false,
      ratelimiterOffset: 0,
      requestTimeout: 15000,
      ...options,
    };

    this.requestHandler = new RequestHandler(this);

    if (this.options.autoFetch) {
      this.fetch();
    }
  }

  /** @hidden */
  #patch(data: WebhookData) {
    if (data.application_id) {
      this.applicationID = data.application_id;
    }

    if (data.avatar) {
      this.avatar = data.avatar;
    }

    if (data.name) {
      this.name = data.name;
    }

    if (data.channel_id) {
      this.channelID = data.channel_id;
    }

    if (data.guild_id) {
      this.guildID = data.guild_id;
    }
  }

  #destroy() {
    this.id = "";
    this.token = "";
  }

  #getThreadTarget(route: string, options: Partial<ThreadLikeTarget>): string {
    const query = new URLSearchParams({ wait: "true" });

    if (options.threadID) {
      query.set("thread_id", options.threadID);
    }

    return `${route}?${query}`;
  }

  async fetch(): Promise<this> {
    const data: WebhookData = await this.requestHandler.request(
      "GET",
      ROUTER.api.webhook(this.id, this.token)
    );

    this.#patch(data);

    return this;
  }

  async edit(options: EditWebhookOptions): Promise<this> {
    if (!options.name && !options.avatar) {
      throw new Error("No valid options were given");
    }

    const data: WebhookData = await this.requestHandler.request(
      "PATCH",
      ROUTER.api.webhook(this.id, this.token),
      {
        avatar: options.avatar,
        name: options.name,
      }
    );

    this.#patch(data);

    return this;
  }

  /**
   *
   * @param id The ID of the message to fetch
   * @param threadID The ID of the thread to fetch the message from
   * @returns The message
   *
   * @future Optional message caching (likely breaking change, to include the possibility of not providing `threadID`)
   *
   * Possibility to provide the 2nd argument as an object to allow the bypass to force a request.
   * `{ threadID: string, forceFetch: boolean }`
   */
  async fetchMessage(id: string, threadID?: string): Promise<Message> {
    const route = this.#getThreadTarget(
      ROUTER.api.webhookMessage(this.id, this.token, id),
      { threadID }
    );

    const data: MessageData = await this.requestHandler.request("GET", route);

    if (!data) throw new Error(`Message '${id}' not found`);

    return new Message(this, data, !!threadID);
  }

  /**
   *
   * @param content The content of the message
   * @param options The options for the message
   * @returns The created message
   */
  async sendMessage(
    content: string | MessageOptions,
    options?: MessageOptions
  ): Promise<Message> {
    if (typeof content !== "string") options = content;
    else if (typeof options !== "object") options = {} as MessageOptions;

    if (typeof options !== "object") throw new Error("Invalid options");

    options = { ...options };

    if (!options.content && typeof content === "string")
      options.content = content;

    if (!options.content && !options.embeds && !options.files)
      throw new Error("No content, embeds or files");

    // @ts-expect-error
    if (options.threadID && options.thread_name)
      throw new Error(
        "Cannot create a thread (thread_name) and send to an existing one (threadID)."
      );

    // Failover to prevent sending components on a user-owned webhook
    // Only kicks in if the webhook instance has succeeded in fetching it's data
    if (this.channelID && !this.applicationID && options.components) {
      throw new Error(
        "Cannot send components in a webhook without an application ID"
      );
    }

    if (options.suppressEmbeds && !options.flags)
      options.flags = MessageFlags.SUPPRESS_EMBEDS;

    const route = this.#getThreadTarget(
      ROUTER.api.webhook(this.id, this.token),
      { threadID: options.threadID }
    );

    const data: MessageData = await this.requestHandler.request(
      "POST",
      route,
      {
        allowed_mentions: options.allowed_mentions,
        avatar_url: options.avatar_url,
        components: options.components,
        content: options.content,
        embeds: options.embeds,
        flags: options.flags,
        tts: options.tts,
        username: options.username,
        // @ts-expect-error
        thread_name: options.thread_name,
      },
      options.files
    );

    const inThread = !!("threadID" in options || "thread_name" in options);
    return new Message(this, data, inThread);
  }

  // Async sendSlackMessage(options: any) {
  //	return this.requestHandler.request('POST', ROUTER.webhook(this.id, this.token).slack(), false, options);
  // }

  // async sendGitHubMessage(options: any) {
  //	return this.requestHandler.request('POST', ROUTER.webhook(this.id, this.token).github(), false, options);
  // }

  // option to check cache before sending, or force request
  async editMessage(
    messageID: string,
    content: string | EditMessageOptions,
    options?: EditMessageOptions
  ): Promise<Message> {
    if (typeof content !== "string") {
      options = content;
    } else if (typeof options !== "object") {
      options = {} as EditMessageOptions;
    }
    if (
      !options.content &&
      !options.embeds &&
      !options.components &&
      !options.files &&
      !options.attachments
    ) {
      throw new Error("No valid options were given");
    }

    const route = this.#getThreadTarget(
      ROUTER.api.webhookMessage(this.id, this.token, messageID),
      options
    );

    const data: MessageData = await this.requestHandler.request(
      "PATCH",
      route,
      {
        attachments: options.attachments,
        allowed_mentions: options.allowed_mentions,
        components: options.components,
        content: options.content,
        embeds: options.embeds,
        flags: options.flags,
      },
      options.files
    );

    const inThread = !!("threadID" in options);
    return new Message(this, data, inThread);
  }

  // Option to check cache before sending, or force request
  async deleteMessage(messageID: string, threadID?: string) {
    const query = new URLSearchParams();
    if (threadID) query.set("thread_id", threadID);

    const route = this.#getThreadTarget(
      ROUTER.api.webhookMessage(this.id, this.token, messageID),
      { threadID }
    );

    await this.requestHandler.request("DELETE", route);
  }

  /**
   * This removes the webhook from the channel, and makes the class instance unusable from this point.
   * @returns void
   */
  async delete() {
    await this.requestHandler.request(
      "DELETE",
      ROUTER.api.webhook(this.id, this.token)
    );

    this.#destroy();
  }
}
