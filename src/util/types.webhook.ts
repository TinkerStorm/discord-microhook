import { Agent } from "node:https";
import { Snowflake } from "./types.common";

export interface WebhookOptions {
	id: Snowflake;
	token: string;
	autoFetch?: boolean;
	
	requestTimeout?: number;
	agent?: Agent;
	ratelimiterOffset?: number;
	latencyThreshold?: number;
};

/**
 * Webhook type is always 'Incoming', as such, it is not included in the interface.
 * @see https://discord.dev/resources/webhook#webhook-object-webhook-types
 */
export interface WebhookData extends EditWebhookOptions {
	id: Snowflake;
	token: string;
	name: string;
	channel_id: string;
	guild_id?: string;
	application_id?: string;
};

export interface EditWebhookOptions {
	avatar?: string;
	name?: string;
}

export interface PartialWebhookMessageOptions {
  username: string;
	avatar_url: string;
}