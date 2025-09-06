import React from 'react';

// Mock context for the Tabs component
interface TabsContextType {
  value: string | null;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({ 
  value: null, 
  onValueChange: () => {} 
});

interface TabsProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  [key: string]: any; // Allow additional props
}

const Tabs = ({ children, value, defaultValue = null, onValueChange, ...props }:TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  
  // Determine if the component is controlled or uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleValueChange = React.useCallback((newValue:string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [isControlled, onValueChange]);

  const contextValue = React.useMemo(() => ({ 
    value: currentValue, 
    onValueChange: handleValueChange
  }), [currentValue, handleValueChange]);

  return <div {...props}><TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider></div>;
};

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  return (
    <button 
      ref={ref} 
      className={className} 
      onClick={() => context.onValueChange(value)} 
      data-state={context.value === value ? 'active' : 'inactive'}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  return context.value === value ? (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  ) : null;
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
