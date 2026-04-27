import type { ReactNode } from 'react';

export type SpeedDialAction = {
  id: string;
  label: string;
  icon: ReactNode;
};

export type SpeedDialProps = {
  actions: SpeedDialAction[];
  icon: ReactNode;
  openIcon?: ReactNode;
  onActionSelect: (actionId: string) => void;
  ariaLabel?: string;
  right?: string;
  bottom?: string;
};

