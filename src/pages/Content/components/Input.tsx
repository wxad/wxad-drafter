import clsx from 'clsx';
import React from 'react';

interface IInput
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const Input: React.FC<IInput> = ({
  onChange,
  value,
  className,
  ...otherProps
}) => {
  return (
    <input
      className={clsx('wxad-draft-input')}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      {...otherProps}
    />
  );
};

export default Input;
