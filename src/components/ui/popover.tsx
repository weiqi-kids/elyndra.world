import React, { useState, createContext, useContext } from 'react';

interface PopoverContextProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const PopoverContext = createContext<PopoverContextProps | undefined>(undefined);

export const Popover: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const ctx = useContext(PopoverContext);
    return (
      <button
        ref={ref}
        onClick={(e) => {
          ctx?.setOpen(!ctx.open);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
PopoverTrigger.displayName = 'PopoverTrigger';

export const PopoverContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  const ctx = useContext(PopoverContext);
  if (!ctx?.open) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};
