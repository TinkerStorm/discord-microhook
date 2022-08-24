# discord-microhook
(ALPHA) A micro package for making use of Discord's webhook infrastructure.

## API

### `Webhook`

- `Webhook.from(url, options)`
- `new Webhook(options)`
- `Webhook~id`
- `Webhook~token`
- `Webhook#delete(reason?): void`
- `Webhook#getMessage(id, forceFetch = false): Message | null`
  > `...#fetchMessage` instead?
- `Webhook#createMessage(options): Message` - options to override avatar and username should be added somewhere...
- `Webhook#deleteMessage(id, reason?): void`
  > An argument to check for the message before removing? - Only check cache if it exists already? ... Or not at all?
- `Webhook#editMessage(id, options): Message`

### `Message`

- `new Message(#webhook, message)`
- `Message~id`
- `Message~content`
- `Message#edit(options): Message`
- `Message#delete(reason)`

## Intended Architecture

- Remain as simple as possible.
  > The primary motivation is to provide a way into a lighter package that handles exactly what it is designed for. Caching is a possibility, but not a primary focus (so if it is added, **it would be added as an opt-in** to increase certainty about memory usage).
- Only focus on webhook architecture.
  > There's a lot of packages that want to cover the entire route network for Discord's API. Everything from Interactions to Invites.
- Universal file handling and content type
  > If the payload has an attachment, the library should be programmed with the adaptability in mind to handle the change to a multipart request.
- Use of the latest version possible will be forced regardless of the options / url provided.
- `thread_id` handling
- Should use of `wait=true` be forced?

---

Primary structure is based on [`eris`](https://abal.moe/Eris) but with the consideration of a webhook as a standalone entity like [discord.js](https://discord.js.org).