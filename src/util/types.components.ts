import { Emoji } from "./types.common";

//#region Enums
export enum ComponentType {
  ACTION_ROW = 1,
  BUTTON = 2,
  SELECT_MENU = 3
}

export enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DESTRUCTIVE = 4,
  LINK = 5,
}
//#endregion

//#region Base structures
interface BaseComponent<Type extends ComponentType = ComponentType> {
  type: Type;
}

interface BaseInteractiveComponent<Type extends Exclude<ComponentType, 'ACTION_ROW'>> extends BaseComponent<Type> {
  disabled?: boolean;
}

interface BaseButtonComponent<Style extends ButtonStyle = ButtonStyle> extends BaseInteractiveComponent<ComponentType.BUTTON> {
  style: Style;
  label?: string;
  emoji?: Partial<Emoji>
};
//#endregion

//#region Sub-structures
export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: Partial<Emoji>;
  default?: boolean;
}
//#endregion

//#region Core Components
export interface ComponentRow extends BaseComponent<ComponentType.ACTION_ROW> {
  components: ChildComponent[];
}

interface SelectComponent extends BaseInteractiveComponent<ComponentType.SELECT_MENU> {
  custom_id: string;
  options: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
}

export interface ResponsiveButton extends Omit<BaseButtonComponent<Exclude<ButtonStyle, ButtonStyle.LINK>>, 'url'> {
  custom_id: string;
}

export interface LinkButton extends Omit<BaseButtonComponent<ButtonStyle.LINK>, 'custom_id'> {
  url: string;
}
//#endregion

//#region Unions
export type ChildComponent = AnyButtonComponent[] | [SelectComponent];

type RequiredButtonUnion = { label: string } | { emoji: Partial<Emoji> };
export type AnyButtonComponent = (ResponsiveButton | LinkButton) & RequiredButtonUnion;
//#endregion