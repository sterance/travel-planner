import { type ComponentPropsWithoutRef, type ReactElement } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import styles from "../../theme/NumberField.module.css";

const mergeClassNames = (...classNames: Array<string | false | null | undefined>): string => classNames.filter(Boolean).join(" ");

export type NumberFieldRootProps = ComponentPropsWithoutRef<typeof BaseNumberField.Root>;
export type NumberFieldInputProps = ComponentPropsWithoutRef<typeof BaseNumberField.Input>;
export type NumberFieldGroupProps = ComponentPropsWithoutRef<typeof BaseNumberField.Group>;
export type NumberFieldScrubAreaProps = ComponentPropsWithoutRef<typeof BaseNumberField.ScrubArea>;
export type NumberFieldScrubAreaCursorProps = ComponentPropsWithoutRef<typeof BaseNumberField.ScrubAreaCursor>;
export type NumberFieldDecrementProps = ComponentPropsWithoutRef<typeof BaseNumberField.Decrement>;
export type NumberFieldIncrementProps = ComponentPropsWithoutRef<typeof BaseNumberField.Increment>;

export interface NumberFieldProps extends Omit<NumberFieldRootProps, "children" | "className"> {
  className?: string;
  inputAriaLabel?: string;
  inputProps?: Omit<NumberFieldInputProps, "className"> & { className?: string };
  scrubAreaProps?: Omit<NumberFieldScrubAreaProps, "className"> & { className?: string };
  scrubAreaCursorProps?: Omit<NumberFieldScrubAreaCursorProps, "className"> & { className?: string };
  groupProps?: Omit<NumberFieldGroupProps, "className"> & { className?: string };
  decrementProps?: Omit<NumberFieldDecrementProps, "className"> & { className?: string };
  incrementProps?: Omit<NumberFieldIncrementProps, "className"> & { className?: string };
}

export const NumberField = ({
  className,
  inputAriaLabel = "Amount",
  inputProps,
  scrubAreaProps,
  scrubAreaCursorProps,
  groupProps,
  decrementProps,
  incrementProps,
  defaultValue,
  value,
  ...rootProps
}: NumberFieldProps): ReactElement => {
  const { className: scrubAreaClassName, ...scrubAreaRest } = scrubAreaProps ?? {};
  const { className: scrubAreaCursorClassName, ...scrubAreaCursorRest } = scrubAreaCursorProps ?? {};
  const { className: groupClassName, ...groupRest } = groupProps ?? {};
  const { className: decrementClassName, ...decrementRest } = decrementProps ?? {};
  const { className: incrementClassName, ...incrementRest } = incrementProps ?? {};
  const { className: inputClassName, ...inputRest } = inputProps ?? {};

  const resolvedDefaultValue = value === undefined ? (defaultValue ?? 100) : undefined;
  const resolvedAriaLabel = inputRest["aria-label"] ?? inputAriaLabel;

  return (
    <BaseNumberField.Root
      {...rootProps}
      value={value}
      defaultValue={resolvedDefaultValue}
      className={mergeClassNames(styles.Field, className)}
    >
      <BaseNumberField.ScrubArea {...scrubAreaRest} className={mergeClassNames(styles.ScrubArea, scrubAreaClassName)}>
        <BaseNumberField.ScrubAreaCursor
          {...scrubAreaCursorRest}
          className={mergeClassNames(styles.ScrubAreaCursor, scrubAreaCursorClassName)}
        >
          <CursorGrowIcon />
        </BaseNumberField.ScrubAreaCursor>
      </BaseNumberField.ScrubArea>

      <BaseNumberField.Group {...groupRest} className={mergeClassNames(styles.Group, groupClassName)}>
        <BaseNumberField.Decrement {...decrementRest} className={mergeClassNames(styles.Decrement, decrementClassName)}>
          <MinusIcon />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          {...inputRest}
          aria-label={resolvedAriaLabel}
          className={mergeClassNames(styles.Input, inputClassName)}
        />
        <BaseNumberField.Increment {...incrementRest} className={mergeClassNames(styles.Increment, incrementClassName)}>
          <PlusIcon />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
};

function CursorGrowIcon(props: ComponentPropsWithoutRef<"svg">): ReactElement {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="black"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

function PlusIcon(props: ComponentPropsWithoutRef<"svg">): ReactElement {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H5M10 5H5M5 5V0M5 5V10" />
    </svg>
  );
}

function MinusIcon(props: ComponentPropsWithoutRef<"svg">): ReactElement {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H10" />
    </svg>
  );
}

export default NumberField;

