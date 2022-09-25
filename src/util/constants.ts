import { PackageJson } from "type-fest";
import { AvatarSize, ImageFormat } from "./types.common";

const pkg: PackageJson = require('../../package.json');

export const BASE_URL = '/api/v10';
export const CDN_URL = 'https://cdn.discordapp.com';

export const USER_AGENT: `DiscordBot (${string}, ${string})` = (() => {
  const version = pkg.version;
  const repository = pkg.repository;

  if (typeof repository === 'object' && repository.url)
    return `DiscordBot (${repository.url}, ${version})`;

  return `DiscordBot (${repository}, ${version})`;
})();

export const ROUTER = {
  webhook: (id: string, token: string) => ({
    base: `${BASE_URL}/webhooks`,
    toString: () => `${BASE_URL}/webhooks/${id}/${token}`,
    message(messageID: string) {
      return `${this}/messages/${messageID}`;
    },
    slack() { return `${this}/slack`; },
    github() { return `${this}/github`; },
  }),
  cdn: {
    avatar: (userID: string, avatar: string, format: ImageFormat = 'png', size: AvatarSize = 128) =>
      `${CDN_URL}/avatars/${userID}/${avatar}.${format}?size=${size}`,
    defaultAvatar: (discriminator: number) => `${CDN_URL}/embed/avatars/${discriminator}.png`,
    emoji: (emojiID: string, animated: boolean) => `${CDN_URL}/emojis/${emojiID}.${animated ? 'gif' : 'png'}`,
  }
};