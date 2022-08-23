import { formatURL } from '../util/common';
import { MessageOptions, WebhookOptions } from '../util/types';

export class Webhook {
	static from(url: URL | string, options: WebhookOptions): Webhook {
		options = { ...options };
		const [id, token, query = ""] = formatURL(url);

		options = { ...options, id, token };
		// Url.href
		// url.searchParams

		return new Webhook(options);
	}

	constructor(options: WebhookOptions) {

	}

	createMessage(options: MessageOptions) {

	}

	editMessage(messageID: string, options: MessageOptions) {

	}

	deleteMessage(messageID: string) {

	}
}
