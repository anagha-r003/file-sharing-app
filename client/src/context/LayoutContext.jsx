import { createContext, useContext, useState, useEffect } from "react";

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [title, setTitle] = useState("");
  const [contentClassName, setContentClassName] = useState("");

  return (
    <LayoutContext.Provider value={{ title, setTitle, contentClassName, setContentClassName }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

export function usePageSettings({ title, contentClassName = "" }) {
  const { setTitle, setContentClassName } = useLayout();

  useEffect(() => {
    if (title !== undefined) {
      setTitle(title);
    }
  }, [title, setTitle]);

  useEffect(() => {
    if (contentClassName !== undefined) {
      setContentClassName(contentClassName);
    }
  }, [contentClassName, setContentClassName]);
}
