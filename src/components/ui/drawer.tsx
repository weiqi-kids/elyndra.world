import React, { useState, createContext, useContext } from 'react';

interface DrawerContextProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

export const Drawer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const DrawerTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const ctx = useContext(DrawerContext);
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
DrawerTrigger.displayName = 'DrawerTrigger';

export const DrawerContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  const ctx = useContext(DrawerContext);
  if (!ctx?.open) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};
