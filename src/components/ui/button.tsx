import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost';
  size?: 'default' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className = '', ...props }, ref) => {
    return (
      <button ref={ref} className={className} {...props} />
    );
  }
);
Button.displayName = 'Button';
