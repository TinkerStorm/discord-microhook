import { ComponentRow } from "./types.components";
import { Embed } from "./types.embeds";

export type WebhookOptions = {
	id: string;
	token: string;
	defaultMessageOptions: MessageOptions;
};

export type MessageOptions = Partial<BaseMessageOptions> & RequiredMessageOptionsUnion;

// wait & thread_id are on query string
export interface BaseMessageOptions {
	content: string;
	username: string;
	avatar_url: string;
	tts: boolean;
	embeds: Embed[];
	allowed_mentions: AllowedMentions;
  components: ComponentRow[];
  attachments: Partial<Attachment>[];
};

type RequiredMessageOptionsUnion = {content: string} | {embeds: Embed[]} | {attachments: Attachment[]};

export interface Attachment {

}

export interface AllowedMentions {

}




