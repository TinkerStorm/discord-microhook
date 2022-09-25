// Node Imports
import EventEmitter from 'node:events';

// Local Imports (Classes)
import { Message } from './Message';
import { RequestHandler } from '../rest/handler';

// Local Imports (Constants + Enums)
import { ROUTER } from '../util/constants';
import { MessageFlags } from '../util/types.message';

// Local Imports (Types)
import type { EditWebhookOptions, WebhookData, WebhookOptions } from '../util/types.webhook';
import type { EditMessageOptions, MessageData, MessageOptions } from '../util/types.message';

export class Webhook extends EventEmitter {
	// protected cache: Map<string, Message> = new Map();
	protected requestHandler: RequestHandler = new RequestHandler(this);

	public options: WebhookOptions;

	public id: string;
	public token: string;

	public applicationID?: string;
	public avatar?: string;
	protected channelID?: string;
	public guildID?: string;
	public name?: string;

	static from(target: URL | string, options: WebhookOptions): Webhook {
		if (!(target instanceof URL))
			target = new URL(target);

		const urlValidation = (
			target.protocol === 'https:' &&
			target.hostname === 'discord.com' &&
			target.pathname.startsWith(ROUTER.webhook('', '').base)
		);

		if (!urlValidation)
			throw new Error('Invalid webhook URL');

		const [id, token] = target.pathname.split('/').slice(3);

		return new Webhook({ ...options, id, token });
	}

	constructor(options: WebhookOptions) {
		// Ensure presence of required options
		if (!options.id || !options.token) throw new Error('Webhook ID and token are required');

		super();

		this.id = options.id;
		this.token = options.token;

		this.options = Object.assign({
			agent: null,
			autoFetch: false,

		}, options);

		if (this.options.autoFetch) this.fetch();
	}

	/** @hidden */
	#patch(data: WebhookData) {
		if (data.application_id) this.applicationID = data.application_id;
		if (data.avatar) this.avatar = data.avatar;
		if (data.name) this.name = data.name;
		if (data.channel_id) this.channelID = data.channel_id;
		if (data.guild_id) this.guildID = data.guild_id;
	}

	#destroy() {
		this.id = '';
		this.token = '';
	}

	async fetch(): Promise<this> {
		const data: WebhookData = await this.requestHandler.request('GET', `webhooks/${this.id}/${this.token}`);

		this.#patch(data);

		return this;
	}

	async edit(options: EditWebhookOptions): Promise<this> {
		if (!options.name && !options.avatar) throw new Error('No valid options were given');

		const data: WebhookData = await this.requestHandler.request(
			'PATCH',
			ROUTER.webhook(this.id, this.token).toString(),
			false,
			{
				avatar: options.avatar,
				name: options.name
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
		const route = ROUTER.webhook(this.id, this.token).message(id);
		const query = new URLSearchParams();
		if (threadID) query.set('thread_id', threadID);
		const url = route + '?' + query.toString();

		const data: MessageData = await this.requestHandler.request('GET', url);

		if (!data) throw new Error(`Message '${id}' not found`);

		return new Message(this, data);
	}

	// as well as options to override default username and avatar...
	async send(content: string | MessageOptions, options?: MessageOptions): Promise<Message> {
		if (typeof content !== 'string') options = content;
		else if (typeof options !== 'object') options = {} as MessageOptions;

		if (typeof options !== 'object') throw new Error('Invalid options');
		options = { ...options };

		if (!options.content && typeof content === 'string') options.content = content;

		if (!options.content && !options.embeds && !options.files)
			throw new Error('No content, embeds or files');

		// Failover to prevent sending components on a user-owned webhook
		// Only kicks in if the webhook instance has succeeded in fetching it's data
		if (this.channelID && !this.applicationID && options.components)
			throw new Error('Cannot send components in a webhook without an application ID');

		if (options.suppressEmbeds && !options.flags) options.flags = MessageFlags.SUPPRESS_EMBEDS;

		const data: MessageData = await this.requestHandler.request(
			'POST',
			ROUTER.webhook(this.id, this.token).toString(),
			false,
			{
				allowed_mentions: options.allowed_mentions,
				avatar_url: options.avatar_url,
				components: options.components,
				content: options.content,
				embeds: options.embeds,
				flags: options.flags,
				tts: options.tts,
				username: options.username
			},
			options.files
		);

		return new Message(this, data);
	}

	//async sendSlackMessage(options: any) {
	//	return this.requestHandler.request('POST', ROUTER.webhook(this.id, this.token).slack(), false, options);
	//}

	//async sendGitHubMessage(options: any) {
	//	return this.requestHandler.request('POST', ROUTER.webhook(this.id, this.token).github(), false, options);
	//}

	// option to check cache before sending, or force request
	async editMessage(messageID: string, content: string | EditMessageOptions, options?: EditMessageOptions): Promise<Message> {
		if (typeof content !== 'string') options = content;
		else if (typeof options !== 'object') options = {} as EditMessageOptions;

		if (!options.content && !options.embeds && !options.components && !options.files && !options.attachments)
			throw new Error('No valid options were given');

		const data: MessageData = await this.requestHandler.request(
			'PATCH',
			ROUTER.webhook(this.id, this.token).message(messageID),
			false,
			{
				attachments: options.attachments,
				allowed_mentions: options.allowed_mentions,
				components: options.components,
				content: options.content,
				embeds: options.embeds,
				flags: options.flags
			},
			options.files
		);

		return new Message(this, data);
	}

	// option to check cache before sending, or force request
	async deleteMessage(messageID: string, reason?: string) {
		await this.requestHandler.request(
			'DELETE',
			ROUTER.webhook(this.id, this.token).message(messageID),
			false,
			{},
			undefined,
			reason
		);
	}

	async delete(reason?: string) {
		await this.requestHandler.request(
			'DELETE',
			ROUTER.webhook(this.id, this.token).toString(),
			false,
			{},
			undefined,
			reason
		);

		this.#destroy();
	}
}