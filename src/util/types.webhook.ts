// #region Imports

// Node types
import type { Agent } from "node:https";

// Local types
import type { Snowflake } from "./types.common";

// #endregion

export interface WebhookOptions {
  id: Snowflake;
  token: string;
  autoFetch?: boolean;

  requestTimeout?: number;
  agent?: Agent;
  ratelimiterOffset?: number;
  latencyThreshold?: number;
}

/**
 * Webhook type is always 'Incoming', as such, it is not included in the interface.
 * @see https://discord.dev/resources/webhook#webhook-object-webhook-types
 */
export type WebhookData = {
  id: Snowflake;
  token: string;
  name: string;
  channel_id: string;
  guild_id?: string;
  application_id?: string;
} & EditWebhookOptions;

export type EditWebhookOptions = {
  avatar?: string;
  name?: string;
};

export type PartialWebhookMessageOptions = {
  username: string;
  avatar_url: string;
};
