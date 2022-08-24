import { RequestHandler } from '../rest/handler';
import { formatURL } from '../util/common';
import { MessageOptions, WebhookOptions } from '../util/types';
import { Message } from './Message';

export class Webhook {
	protected cache: Map<string, Message> = new Map();
	protected requestHandler: RequestHandler = new RequestHandler();

	public id: string;
	public token: string;

	public application_id?: string;
	public avatar?: string;
	public channel_id?: string;
	public guild_id?: string;
	public name?: string;

	static from(url: URL | string, options: WebhookOptions): Webhook {
		options = { ...options };
		const [id, token, query = ""] = formatURL(url);

		options = { ...options, id, token };
		// Url.href
		// url.searchParams

		return new Webhook(options);
	}

	constructor(options: WebhookOptions) {
		this.id = options.id;
		this.token = options.token;

		// defaultMessageOptions

		// if (options.autoFetch) this.getData();
	}

	getData() {
		// const data: WebhookData = await fetch('GET', `webhooks/${this.id}/${this.token}`)
		// if (data.application_id) this.application_id = data.application_id;
		// if (data.avatar) this.avatar = data.avatar;
		// if (data.name) this.name = data.name;

		// this.channel_id = data.channel_id;
		// this.guild_id = data.guild_id;
	}

	getMessage(id: string, forceFetch: boolean = false) {
		if (forceFetch) {
			// fetch message, add to cache
		}

		return this.cache.get(id);
	}

	// as well as options to override default username and avatar...
	async createMessage(options: MessageOptions): Promise<Message> {
		return new Message(this, {});
	}

	// option to check cache before sending, or force request
	async editMessage(messageID: string, options: MessageOptions): Promise<Message> {
		return new Message(this, {});
	}

	// option to check cache before sending, or force request
	async deleteMessage(messageID: string, reason?: string) {
		// this.request('DELETE', `webhooks/${this.id}/${this.token}/messages/${messageID}`, { reason })
		if (this.cache.has(messageID)) this.cache.delete(messageID);
	}

	async delete(reason?: string) {
		// this.request('DELETE', `webhooks/${this.id}/${this.token}`, { reason })
		// this.destroy();
	}
}