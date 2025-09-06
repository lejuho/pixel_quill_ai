import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useState } from "react";

import { X } from "lucide-react";

// 1. Create Context
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// 2. Create Provider
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

// 3. Custom Hook to use Context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// 4. Sidebar Component
export const Sidebar = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 ${className}`}>
        {children}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed top-0 left-0 h-full w-64 flex flex-col z-50 bg-slate-950 ${className}`}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              {children}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// 5. Sidebar Trigger (for mobile)
export const SidebarTrigger = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
  const { setIsOpen } = useSidebar();
  return (
    <button className={className} onClick={() => setIsOpen(true)}>
      {children || (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      )}
    </button>
  );
};

// 6. Helper Components
export const SidebarHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>{children}</div>
);

export const SidebarContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex-1 overflow-y-auto ${className}`}>{children}</div>
);

export const SidebarFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>{children}</div>
);

export const SidebarGroup = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
);

export const SidebarGroupLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
);

export const SidebarGroupContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={className}>{children}</div>
);

export const SidebarMenu = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <ul className={className}>{children}</ul>
);

export const SidebarMenuItem = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <li className={className}>{children}</li>
);

export const SidebarMenuButton = ({ children, className, asChild }: { children: React.ReactNode, className?: string, asChild?: boolean }) => {
    if (asChild) {
        return <div className={className}>{children}</div>;
    }
    return <button className={className}>{children}</button>;
};
