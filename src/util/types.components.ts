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

interface BaseComponentRow extends BaseComponent<ComponentType.ACTION_ROW> {
	components: ChildComponentRow[];
}

interface BaseButtonComponent<Style extends ButtonStyle = ButtonStyle> extends BaseInteractiveComponent<ComponentType.BUTTON> {
  style: Style;
  label?: string;
  emoji?: Partial<Emoji>
};

interface SelectComponent extends BaseInteractiveComponent<ComponentType.SELECT_MENU> {
  custom_id: string;
  options: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
}

//#endregion

//#region Sub-structures

interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: Partial<Emoji>;
  default?: boolean;
}

//#endregion

//#region Inheritance

interface ResponsiveButton extends Omit<BaseButtonComponent<Exclude<ButtonStyle, 'LINK'>>, 'url'> { custom_id: string; }
interface LinkButton extends Omit<BaseButtonComponent<ButtonStyle.LINK>, 'custom_id'> { url: string; }

//#endregion

//#region Unions
type ButtonComponent = (ResponsiveButton | LinkButton) & RequiredButtonUnion;

type ChildComponentRow = ButtonComponent[] | [SelectComponent];
type RequiredButtonUnion = { label: string } | { emoji:Partial<Emoji> };
//#endregion

//#region Aliases
export type ComponentRow = BaseComponentRow;
//#endregion

//#region Core components

//#endregion




