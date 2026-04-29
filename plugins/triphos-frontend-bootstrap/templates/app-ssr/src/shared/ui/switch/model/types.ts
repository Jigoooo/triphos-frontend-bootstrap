export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string | undefined;
  disabled?: boolean;
};
