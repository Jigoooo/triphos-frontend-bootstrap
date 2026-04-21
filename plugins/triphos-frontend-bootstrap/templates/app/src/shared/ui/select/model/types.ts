export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
};

