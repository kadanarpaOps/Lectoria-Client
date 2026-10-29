import { Outlet } from "react-router";
import Sidebar from "../components/navigation/Sidebar";
import Navbar from "../components/navigation/Navbar";
import { useEffect, useState } from "react";

const MainLayout = () => {

  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !window.matchMedia("(max-width: 767px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateLayout = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      setIsSidebarOpen(!event.matches);
    };
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar isSidebarOpen={isSidebarOpen} isMobile={isMobile} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
