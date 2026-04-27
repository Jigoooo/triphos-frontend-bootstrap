import { BaseButton } from './base-button';
import type { BaseButtonProps } from '../model/types';

export function RawButton(props: BaseButtonProps) {
  return <BaseButton {...props} />;
}
