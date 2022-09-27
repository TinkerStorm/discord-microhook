# discord-microhook

[![ESLint](https://github.com/TinkerStorm/discord-microhook/actions/workflows/lint.yaml/badge.svg)](https://github.com/TinkerStorm/discord-microhook/actions/workflows/lint.yaml)
[![DeepScan](https://badgen.net/deepscan/grade/team/16068/project/22443/branch/662131)]()
[![Discord](https://badgen.net/discord/online-members/Bb3JQQG)](https://discord.gg/Bb3JQQG)
[![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label&color=007ACC)]()

A micro package for making use of Discord's webhook infrastructure. This package is designed to be as simple as possible, and is not intended to be a full-featured Discord API wrapper.

It's design is intended to be as minimal as possible, but still includes the ability to send string content and embeds alongside file attachments.

[Documentation](https://tinkerstorm.github.io/discord-microhook)

## Regular Usage

```js
import { Webhook } from 'discord-microhook';

const webhook = new Webhook({
  id: '1234567890',
  token: 'abcdefg',
  autoFetch: true
});

webhook.send('Hello, world!');
```

## Construct from URL

```js
import { Webhook } from 'discord-microhook';

const webhook = Webhook.from(
  'https://discordapp.com/api/webhooks/1234567890/abcdefg',
  {
    autoFetch: true
  }
);

webhook.send('Hello, world!');
```


## Justification

Discord's webhook infrastructure is a great way to send messages to a channel without having to worry about authentication. Other packages are either mainstream (utilizing the entirety of the Discord API) or would fail to comply with Discord's rate limit and file handling specifications. This package is meant to be a simple, lightweight alternative to other packages - while supporting as much as possible within the scope of [Webhooks](https://discord.dev/resources/webhook) **without an app token**.

> While it does retain attributes or design qualities of the libraries it was inspired by, **it will not** follow their design patterns nor will it permit cross-package compatibility immediately out of the box. This has been seen, time and time again on [`slash-create`'s issue tracker](https://github.com/Snazzah/slash-create/issues?q=is%3Aissue+discord.js+is%3Aclosed), and is not something I wish to repeat. *Issues and PRs regarding this will be closed, with a link to this section.*

### Supporting forum channels

The support of forum channels for webhooks is rather limited with what Discord provides to the package (when only using a webhook token).

- When sending a message to a forum channel, `thread_name` **must** be provided - the library has no way to determine what type of channel it is targeting.
- After the first message is sent as the initial message to a post, this library **cannot** change it's title, close or lock the thread by itself.

### Request authentication changes

- `RequestHandler` has been patched further for specifc use in this library to accept a `token` in it's `#request` method, rather than a boolean to specify if it should use the token it would have retrieved from the client instance. It is your responsibility as an developer / engineer that the token provided has the correct prefix.
- The `token: string` argument replaces `auth: boolean` and is placed after the `file` argument in the request handler, as it is not required for any request - but may still be used by itself in unique circumstances (i.e. requesting data outside the scope of the library - i.e. guilds, reactions, channels).

### Intended Architecture

- Remain as simple as possible.
  > The primary motivation is to provide a way into a lighter package that handles exactly what it is designed for. Caching is a possibility, but not a primary focus (so if it is added, **it would be added as an opt-in** to increase certainty about memory usage).
- (`Webhook#send`) Use of `wait=true` is forced, the library does not support an argument to disable it.
- If `thread_name` and `threadID` are both provided in the options to create a new message in a forum channel, the method will throw a `TypeError`.

## Future

- Message caching
  > It is currently impossible to *patch* Message instances without having to cache them in the first place. This is a possibility, but not a priority.
- Parallel ratelimit handling (i.e. providing a base request bucket to extend from for services like Redis or KeyDB)
  > The integration here would likely require an asynchronous bucket (as well as additional methods to handle the values it keeps in memory), and would be opt-in (SequentialBucket would continue to be the default, and extend from this 'BaseBucket' in some way).
- Test suite ([#3](https://github.com/TinkerStorm/discord-microhook/issues/3))
  > Given the smaller size of this package, it is not a priority to have a test suite. However, it is something that may be added in the future for confidence and peace of mind in it's certainty.

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
