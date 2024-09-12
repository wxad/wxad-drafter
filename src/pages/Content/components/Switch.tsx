import { clsx } from 'clsx';
import React from 'react';

export interface ISwitchProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Switch: React.FC<ISwitchProps> = ({
  checked,
  onChange,
  className,
  onClick,
  children,
  ...otherProps
}) => {
  return (
    <div
      className={clsx(
        'wxad-draft-switch',
        checked && 'wxad-draft-switch-checked',
        className
      )}
      onClick={(e) => {
        onChange(!checked);
        if (onClick) {
          onClick(e);
        }
      }}
      {...otherProps}
    >
      <div className="wxad-draft-switch-button">
        <div className="wxad-draft-switch-button-thumb" />
      </div>
      {children}
    </div>
  );
};

export default Switch;
