export interface Embed extends Omit<EmbedOptions, 'type'> {
  type: EmbedType;
  footer?: EmbedFooter;
  image?: EmbedImageCommon;
  thumbnail?: EmbedImageCommon;
  video?: EmbedVideo;
  provider?: EmbedProvider;
  author?: EmbedAuthor;
}

export interface EmbedOptions {
  /** The title of the embed. */
  title?: string;
  /** Type of embed (forced to RICH for custom embeds). */
  type?: EmbedType.RICH;
  /** The description of the embed. */
  description?: string;
  /** The URL of the embed. */
  url?: string;
  /** The timestamp of the embed content. */
  timestamp?: string;
  /** The color code of the embed. */
  color?: number;
  /** The footer information. */
  footer?: EmbedFooterOptions;
  /** The image information. */
  image?: EmbedImageCommonOptions;
  /** The thumbnail information. */
  thumbnail?: EmbedImageCommonOptions;
  author?: EmbedAuthorOptions;
  /** The fields of the embed. */
  fields?: EmbedField[];
}

/** @deprecated */
export enum EmbedType {
  RICH = 'rich',
  IMAGE = 'image',
  VIDEO = 'video',
  GIFV = 'gifv',
  ARTICLE = 'article',
  LINK = 'link'
}

/** Data shared between embed media elements. */
interface ImageCommon {
  /** The height of the media element. */
  height?: number;
  /** The width of the media element. */
  width?: number;
}

export interface EmbedFooterOptions {
  /** The footer text. */
  text: string;
  /** The URL of the footer icon. */
  icon_url?: string;
}

export interface EmbedImageCommonOptions {
  /** The source URL of the image. */
  url?: string;
}

export interface EmbedAuthorOptions {
  /** The name of the author. */
  name: string;
  /** The URL of the author. */
  url?: string;
  /** The URL of the author icon. */
  icon_url?: string;
}

export interface EmbedFooter extends EmbedFooterOptions {
  /** The proxy URL of the footer icon. */
  proxy_icon_url?: string;
}

export interface EmbedImageCommon extends EmbedImageCommonOptions, ImageCommon {
  /** The proxy URL of the image. */
  proxy_url?: string;
}

export interface EmbedAuthor extends EmbedAuthorOptions {
  /** The proxy URL of the author icon. */
  proxy_icon_url?: string;
}

export interface EmbedField {
  /** The name of the field. */
  name: string;
  /** The value of the field. */
  value: string;
  /** Whether or not this field should display inline. */
  inline?: boolean;
}

export interface EmbedProvider {
  /** The name of the provider. */
  name?: string;
  /** The URL of the provider. */
  url?: string;
}

export interface EmbedVideo extends ImageCommon {
  /** The source URL of the video. */
  url?: string;
}