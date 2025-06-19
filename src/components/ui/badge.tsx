import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', ...props }, ref) => (
    <span ref={ref} className={className} {...props} />
  )
);
Badge.displayName = 'Badge';
