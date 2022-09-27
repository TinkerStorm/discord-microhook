// #region Imports

// Local types
import type { EmojiData } from "./types.common";

// #endregion

// #region Enums
export enum ComponentType {
  ACTION_ROW = 1,
  BUTTON = 2,
  SELECT_MENU = 3,
}

export enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DESTRUCTIVE = 4,
  LINK = 5,
}
// #endregion

// #region Base structures

/**
 * A generic component, could be a {@see ResponsiveButton}, {@see SelectMenu}, or {@see ComponentRow}. This acts as the base for all components in this library.
 */
type BaseComponent<Type extends ComponentType = ComponentType> = {
  type: Type;
};

/**
 * A component that can be sent with a message.
 */
export interface BaseInteractiveComponent<
  Type extends Exclude<ComponentType, "ACTION_ROW">
> extends BaseComponent<Type> {
  disabled?: boolean;
}

/** A component interface used for all button components. */
interface BaseButtonComponent<Style extends ButtonStyle = ButtonStyle>
  extends BaseInteractiveComponent<ComponentType.BUTTON> {
  style: Style;
  label?: string;
  emoji?: Partial<EmojiData>;
}
// #endregion

// #region Sub-structures

/**
 * An option for a select menu.
 */
export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: Partial<EmojiData>;
  default?: boolean;
}
// #endregion

// #region Core Components
/**
 * A component row is a container for components.
 */
export interface ComponentRow extends BaseComponent<ComponentType.ACTION_ROW> {
  components: ChildComponent[];
}

/**
 * A select menu component for selecting one or more items from a list.
 */
export interface SelectComponent
  extends BaseInteractiveComponent<ComponentType.SELECT_MENU> {
  custom_id: string;
  options: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
}

/**
 * A button component for sending an interaction.
 */
export interface ResponsiveButton
  extends Omit<
    BaseButtonComponent<Exclude<ButtonStyle, ButtonStyle.LINK>>,
    "url"
  > {
  custom_id: string;
}

/**
 * A button component for redirecting to a link when clicked.
 */
export interface LinkButton
  extends Omit<BaseButtonComponent<ButtonStyle.LINK>, "custom_id"> {
  url: string;
}
// #endregion

// #region Unions
/**
 * Any child component of a component row.
 */
export type ChildComponent = AnyButtonComponent[] | [SelectComponent];

/**
 * Mutually inclusive union of required button props.
 */
export type RequiredButtonUnion =
  | { label: string }
  | { emoji: Partial<EmojiData> };

/**
 * Any button component, including mutually inclusive props.
 */
export type AnyButtonComponent = (ResponsiveButton | LinkButton) &
  RequiredButtonUnion;
// #endregion
