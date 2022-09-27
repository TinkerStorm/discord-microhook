// #region Imports

// Node modules
import HTTPS from "node:https";
import Zlib from "node:zlib";

// Local classes
import { SequentialBucket } from "./bucket";
import { MultipartData } from "./multipart";

import { DiscordHTTPError } from "../errors/DiscordHTTPError";
import { DiscordRESTError } from "../errors/DiscordRESTError";

// Local constants & types
import { BASE_URL, USER_AGENT } from "../util/constants";

import type { Webhook } from "../structures/Webhook";
import type { FileAttachment } from "../util/types.message";

// #endregion

/**
 * The request handler for REST requests.
 * @private
 */
export class RequestHandler {
  /** The base URL for all requests. */
  readonly baseURL: string = BASE_URL;
  /** The user agent for all requests. */
  readonly userAgent: string = USER_AGENT;
  /** The ratelimits per route. */
  readonly ratelimits: Record<string, SequentialBucket> = {};
  /** The amount of time a request will timeout. */
  readonly requestTimeout: number;
  /** TheHTTP agent used in the request handler. */
  readonly agent?: HTTPS.Agent;
  /** The latency reference for the handler. */
  readonly latencyRef: LatencyRef;
  /** Whether the handler is globally blocked. */
  globalBlock = false;
  /** The request queue. */
  readonly readyQueue: any[] = [];

  /** The creator that initialized the handler. */
  private readonly _webhook: Webhook;

  /** @param webhook The instantiating creator. */
  constructor(webhook: Webhook) {
    this._webhook = webhook;
    this.requestTimeout = webhook.options.requestTimeout as number;
    this.agent = webhook.options.agent;
    this.latencyRef = {
      latency: 500,
      offset: webhook.options.ratelimiterOffset,
      raw: new Array(10).fill(500),
      timeOffset: 0,
      timeOffsets: new Array(10).fill(0),
      lastTimeOffsetCheck: 0,
    };
  }

  /** Unblocks the request handler. */
  globalUnblock() {
    this.globalBlock = false;
    while (this.readyQueue.length > 0) {
      this.readyQueue.shift()();
    }
  }

  /**
   * Make an API request
   * @param method Uppercase HTTP method
   * @param url URL of the endpoint
   * @param body Request payload
   * @param file The file(s) to send
   * @param token Authorization token
   * @param reason The reason for the request (for endpoints that support it)
   */
  async request(
    method: string,
    url: string,
    body?: any,
    file?: FileAttachment | FileAttachment[],
    token?: string,
    reason?: string,
    _route?: string,
    short = false
  ): Promise<any> {
    const route = _route || this.routefy(url, method);

    const _stackHolder: { stack: string } = { stack: "" }; // Preserve async stack
    Error.captureStackTrace(_stackHolder);

    return new Promise((resolve, reject) => {
      let attempts = 0;

      const actualCall = (cb: Function) => {
        const headers: Record<string, string> = {
          "User-Agent": this.userAgent,
          "Accept-Encoding": "gzip,deflate",
          "X-RateLimit-Precision": "millisecond",
          ...(reason ? { "X-Audit-Log-Reason": reason } : {}),
        };
        let data: any;
        const finalURL = url;

        try {
          if (token) {
            // if (!this._webhook.options.token) throw new Error('No token was set in the Webhook.');
            headers.Authorization = `Bot ${token}`;
          }
          if (file) {
            if (!Array.isArray(file)) {
              if (!file.file) {
                throw new Error("Invalid file object.");
              }

              file = [file];
            }

            const multipart = new MultipartData();
            headers["Content-Type"] = multipart.contentType;
            file.forEach((f, i) =>
              multipart.attach(`files[${i}]`, f.file, f.name)
            );
            if (body) {
              multipart.attach("payload_json", body);
            }

            data = multipart.finish();
          } else if (body) {
            if (method !== "GET" && method !== "DELETE") {
              data = JSON.stringify(body);
              headers["Content-Type"] = "application/json";
            }
          }
        } catch (err) {
          cb();
          reject(err);
          return;
        }

        const req = HTTPS.request({
          method,
          host: "discord.com",
          path: this.baseURL + finalURL,
          headers,
          agent: this.agent,
        });

        let reqError: any;

        req
          .once("abort", () => {
            cb();
            reqError =
              reqError ||
              new Error(`Request aborted by client on ${method} ${url}`);
            reqError.req = req;
            reject(reqError);
          })
          .once("error", (err) => {
            reqError = err;
            req.abort();
          });

        let latency = Date.now();

        req.once("response", (resp) => {
          if (this._webhook.listeners("rawREST").length) {
            this._webhook.emit("rawREST", {
              method,
              url,
              auth: !!token,
              body,
              reason,
              route,
              short,
              resp,
            });
          }

          latency = Date.now() - latency;
          this.latencyRef.raw.push(latency);
          this.latencyRef.latency =
            this.latencyRef.latency -
            ~~(this.latencyRef.raw.shift()! / 10) +
            ~~(latency / 10);

          const headerNow = Date.parse(resp.headers.date!);
          if (this.latencyRef.lastTimeOffsetCheck < Date.now() - 5000) {
            const timeOffset =
              headerNow +
              500 -
              (this.latencyRef.lastTimeOffsetCheck = Date.now());
            if (
              this.latencyRef.timeOffset - this.latencyRef.latency >=
                this._webhook.options.latencyThreshold! &&
              timeOffset - this.latencyRef.latency >=
                this._webhook.options.latencyThreshold!
            ) {
              this._webhook.emit(
                "warn",
                new Error(
                  `Your clock is ${this.latencyRef.timeOffset}ms behind Discord's server clock. Please check your connection and system time.`
                )
              );
            }

            this.latencyRef.timeOffset =
              this.latencyRef.timeOffset -
              ~~(this.latencyRef.timeOffsets.shift()! / 10) +
              ~~(timeOffset / 10);
            this.latencyRef.timeOffsets.push(timeOffset);
          }

          resp.once("aborted", () => {
            cb();
            reqError =
              reqError ||
              new Error(`Request aborted by server on ${method} ${url}`);
            reqError.req = req;
            reject(reqError);
          });

          let response: any = "";

          let _respStream = resp;
          if (resp.headers["content-encoding"]) {
            if (resp.headers["content-encoding"].includes("gzip")) {
              // @ts-expect-error
              _respStream = resp.pipe(Zlib.createGunzip());
            } else if (resp.headers["content-encoding"].includes("deflate")) {
              // @ts-expect-error
              _respStream = resp.pipe(Zlib.createInflate());
            }
          }

          _respStream
            .on("data", (str) => {
              response += str;
            })
            .on("error", (err) => {
              reqError = err;
              req.abort();
            })
            .once("end", () => {
              const now = Date.now();

              if (resp.headers["x-ratelimit-limit"]) {
                this.ratelimits[route].limit = Number(
                  resp.headers["x-ratelimit-limit"]
                );
              }

              if (
                method !== "GET" &&
                (resp.headers["x-ratelimit-remaining"] == undefined ||
                  resp.headers["x-ratelimit-limit"] == undefined) &&
                this.ratelimits[route].limit !== 1
              ) {
                this._webhook.emit(
                  "debug",
                  `Missing ratelimit headers for SequentialBucket(${this.ratelimits[route].remaining}/${this.ratelimits[route].limit}) with non-default limit\n` +
                    `${resp.statusCode} ${resp.headers["content-type"]}: ${method} ${route} | ${resp.headers["cf-ray"]}\n` +
                    "content-type = " +
                    "\n" +
                    "x-ratelimit-remaining = " +
                    resp.headers["x-ratelimit-remaining"] +
                    "\n" +
                    "x-ratelimit-limit = " +
                    resp.headers["x-ratelimit-limit"] +
                    "\n" +
                    "x-ratelimit-reset = " +
                    resp.headers["x-ratelimit-reset"] +
                    "\n" +
                    "x-ratelimit-global = " +
                    resp.headers["x-ratelimit-global"]
                );
              }

              this.ratelimits[route].remaining =
                resp.headers["x-ratelimit-remaining"] === undefined
                  ? 1
                  : Number(resp.headers["x-ratelimit-remaining"]) || 0;

              let retryAfter = parseInt(resp.headers["retry-after"]!);
              // Discord breaks RFC here, using milliseconds instead of seconds (╯°□°）╯︵ ┻━┻
              // This is the unofficial Discord dev-recommended way of detecting that
              if (
                retryAfter &&
                (typeof resp.headers.via !== "string" ||
                  !resp.headers.via.includes("1.1 google"))
              ) {
                retryAfter *= 1000;
                if (retryAfter >= 1000 * 1000) {
                  this._webhook.emit(
                    "warn",
                    `Excessive Retry-After interval detected (Retry-After: ${resp.headers["retry-after"]} * 1000, Via: ${resp.headers.via})`
                  );
                }
              }

              if (retryAfter >= 0) {
                if (resp.headers["x-ratelimit-global"]) {
                  this.globalBlock = true;
                  setTimeout(() => {
                    this.globalUnblock();
                  }, retryAfter || 1);
                } else {
                  this.ratelimits[route].reset = (retryAfter || 1) + now;
                }
              } else if (resp.headers["x-ratelimit-reset"]) {
                if (
                  ~route.lastIndexOf("/reactions/:id") &&
                  Number(resp.headers["x-ratelimit-reset"]) * 1000 -
                    headerNow ===
                    1000
                ) {
                  this.ratelimits[route].reset = now + 250;
                } else {
                  this.ratelimits[route].reset = Math.max(
                    Number(resp.headers["x-ratelimit-reset"]) * 1000 -
                      this.latencyRef.timeOffset,
                    now
                  );
                }
              } else {
                this.ratelimits[route].reset = now;
              }

              if (resp.statusCode !== 429) {
                this._webhook.emit(
                  "debug",
                  `${body && body.content} ${now} ${route} ${
                    resp.statusCode
                  }: ${latency}ms (${this.latencyRef.latency}ms avg) | ${
                    this.ratelimits[route].remaining
                  }/${this.ratelimits[route].limit} left | Reset ${
                    this.ratelimits[route].reset
                  } (${this.ratelimits[route].reset - now}ms left)`
                );
              }

              if (resp.statusCode! >= 300) {
                if (resp.statusCode === 429) {
                  this._webhook.emit(
                    "debug",
                    `${
                      resp.headers["x-ratelimit-global"]
                        ? "Global"
                        : "Unexpected"
                    } 429 (╯°□°）╯︵ ┻━┻: ${response}\n${
                      body && body.content
                    } ${now} ${route} ${resp.statusCode}: ${latency}ms (${
                      this.latencyRef.latency
                    }ms avg) | ${this.ratelimits[route].remaining}/${
                      this.ratelimits[route].limit
                    } left | Reset ${this.ratelimits[route].reset} (${
                      this.ratelimits[route].reset - now
                    }ms left)`
                  );
                  // For some reason, the Retry-After header isn't in ms precision
                  // This should hopefully fix any spam requests
                  if (response) {
                    try {
                      response = JSON.parse(response);
                      if (response.retry_after) {
                        retryAfter = response.retry_after * 1000 + 250;
                      }
                    } catch (err) {
                      reject(err);
                      return;
                    }
                  }

                  if (retryAfter) {
                    setTimeout(() => {
                      cb();
                      this.request(
                        method,
                        url,
                        body,
                        file,
                        token,
                        reason,
                        route,
                        true
                      )
                        .then(resolve)
                        .catch(reject);
                    }, retryAfter);
                    return;
                  }

                  cb();
                  this.request(
                    method,
                    url,
                    body,
                    file,
                    token,
                    reason,
                    route,
                    true
                  )
                    .then(resolve)
                    .catch(reject);
                  return;
                }

                if (resp.statusCode === 502 && ++attempts < 4) {
                  this._webhook.emit(
                    "debug",
                    "A wild 502 appeared! Thanks CloudFlare!"
                  );
                  setTimeout(() => {
                    this.request(
                      method,
                      url,
                      body,
                      file,
                      token,
                      reason,
                      route,
                      true
                    )
                      .then(resolve)
                      .catch(reject);
                  }, Math.floor(Math.random() * 1900 + 100));
                  return cb();
                }

                cb();

                if (response.length > 0) {
                  if (resp.headers["content-type"] === "application/json") {
                    try {
                      response = JSON.parse(response);
                    } catch (err) {
                      reject(err);
                      return;
                    }
                  }
                }

                let { stack } = _stackHolder;
                if (stack.startsWith("Error\n")) {
                  stack = stack.substring(6);
                }

                const ErrorType = response.code
                  ? DiscordRESTError
                  : DiscordHTTPError;
                const err = new ErrorType(req, resp, response, stack);

                reject(err);
                return;
              }

              if (response.length > 0) {
                if (resp.headers["content-type"] === "application/json") {
                  try {
                    response = JSON.parse(response);
                  } catch (err) {
                    cb();
                    reject(err);
                    return;
                  }
                }
              }

              cb();
              resolve(response);
            });
        });

        req.setTimeout(this.requestTimeout, () => {
          reqError = new Error(
            `Request timed out (>${this.requestTimeout}ms) on ${method} ${url}`
          );
          req.abort();
        });

        if (Array.isArray(data)) {
          for (const chunk of data) {
            req.write(chunk);
          }

          req.end();
        } else {
          req.end(data);
        }
      };

      const queue = () => {
        this.ratelimits[route] ??= new SequentialBucket(1, this.latencyRef);
        this.ratelimits[route].queue(actualCall, short);
      };

      if (this.globalBlock && token) this.readyQueue.push(queue);
      else queue();
    });
  }

  routefy(url: string, method: string) {
    let route = url
      .replace(/\/([a-z-]+)\/(?:[0-9]{17,19})/g, (match, p) =>
        p === "channels" ||
        p === "guilds" ||
        p === "webhooks" ||
        p === "interactions"
          ? match
          : `/${p}/:id`
      )
      .replace(/\/reactions\/[^/]+/g, "/reactions/:id")
      .replace(/^\/webhooks\/(\d+)\/[A-Za-z0-9-_]{64,}/, "/webhooks/$1/:token")
      .replace(/\/[A-Za-z0-9-_]{64,}\/callback$/, "/:token/callback");
    if (method === "DELETE" && route.endsWith("/messages/:id")) {
      // Delete Messsage endpoint has its own ratelimit
      route = method + route;
    }

    return route;
  }

  toString() {
    return "[RequestHandler]";
  }
}

/** @hidden */
type LatencyRef = {
  latency: number;
  offset?: number;
  raw: number[];
  timeOffset: number;
  timeOffsets: number[];
  lastTimeOffsetCheck: number;
};
