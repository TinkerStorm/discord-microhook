# discord-microhook
A micro package for making use of Discord's webhook infrastructure. This package is designed to be as simple as possible, and is not intended to be a full-featured Discord API wrapper.

It's design is intended to be as minimal as possible, but still includes the.

## Justification

Discord's webhook infrastructure is a great way to send messages to a channel without having to worry about authentication. Other packages are either mainstream (utilizing the entirety of the Discord API) or would fail to comply with Discord's rate limit and file handling specifications. This package is meant to be a simple, lightweight alternative to other packages - while supporting as much as possible within the scope of [Webhooks](https://discord.dev/resources/webhook) **without an app token**.

### Supporting forum channels

The support of forum channels for webhooks is rather limited with what Discord provides to the package (when only using a webhook token).

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
- `thread_id` & `thread_name` handling
- Should use of `wait=true` be forced?

---

## Credit

The primary motivation for this package existing, is to be able to provide a webhook-only package for Discord's API that is as lightweight as possible... and API compliant *mainly focusing on file handling and rate limits*.

- [`discord.js`](https://discord.js.org) ([GitHub](https://github.com/discordjs/discord.js))
- [`eris`](https://abal.moe/Eris) ([GitHub](https://github.com/abalabahaha/eris))
- [`slash-create`](https://slash-create.js.org) ([GitHub](https://github.com/Snazzah/slash-create))

### Library style

There is a common misconception that a package is *obligated* or *required* to follow the style of another *or styles of many*, because of the similarities between or references said packages. 

### Patching `RequestHandler`

> Involving `eris` and `slash-create`.
> - [PR 1285 (eris)](https://github.com/abalabahaha/eris/pull/1285)
> - [PR 358 (SC)](https://github.com/Snazzah/slash-create/pull/358)
> - [PR 361 (SC)](https://github.com/Snazzah/slash-create/pull/361)

Despite reaching the same conclusion to patch `RequestHandler`, the older pull request (PR) was not referred to throughout patching `slash-create`'s `RequestHandler`. I (sudojunior), had not discovered it until the PR for `slash-create` was opened. *PRs on `slash-create` were merged on 30th August 2021.*

### Structure descriptions

Interface descriptions are provided from the API documentation, as well as some grammatical fixes where possible. The patches in place are of my own choice, and are not necessarily the same as the API documentation - or preferred by the maintainers of the documentation itself.

> [Discord Developer Documentation (discord.dev)](https://discord.dev)