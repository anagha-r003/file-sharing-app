import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PageLayout from "./PageLayout";
import { useLayout } from "../context/LayoutContext";

function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { title, contentClassName } = useLayout();

  // Responsive sidebar logic
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <PageLayout
      title={title}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onMenuClick={() => setSidebarOpen((prev) => !prev)}
      contentClassName={contentClassName}
    >
      <Outlet />
    </PageLayout>
  );
}

export default ProtectedLayout;
