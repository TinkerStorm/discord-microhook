// #region Imports

// Package Types
import type { PackageJson } from "type-fest";

// Local Types
import type { AvatarSize, ImageFormat } from "./types.common";

// #endregion

const pkg: PackageJson = require("../../package.json");

export const BASE_URL = "/api/v10";
export const CDN_URL = "https://cdn.discordapp.com";

export const USER_AGENT: `DiscordBot (${string}, ${string})` = (() => {
  const { version, repository } = pkg;

  if (typeof repository === "object" && "url" in repository) {
    return `DiscordBot (${repository.url}, ${version})`;
  }

  return `DiscordBot (${repository}, ${version})`;
})();

export const ROUTER = {
  api: {
    webhook: (id: string, token: string) => `/webhooks/${id}/${token}`,
    webhookMessage: (id: string, token: string, messageID: string) =>
      `/webhooks/${id}/${token}/messages/${messageID}`,
  },
  cdn: {
    avatar: (
      userID: string,
      avatar: string,
      format: ImageFormat = "png",
      size: AvatarSize = 128
    ) => `${CDN_URL}/avatars/${userID}/${avatar}.${format}?size=${size}`,
    defaultAvatar: (discriminator: number) =>
      `${CDN_URL}/embed/avatars/${discriminator}.png`,
    emoji: (emojiID: string, format: ImageFormat) =>
      `${CDN_URL}/emojis/${emojiID}.${format}`,
  },
};
