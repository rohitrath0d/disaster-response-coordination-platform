import { SidebarProvider } from "../ui/sidebar";
import { Outlet } from "react-router-dom";
import SideBar from "../pages/SideBar";

const SidebarLayout = () => {
  return (

    <SidebarProvider>
      <div className="flex h-screen w-full">
        <div className="w-61 flex-shrink-0 h-full">

          {/* Sidebar - fixed width */}
          <SideBar />
        </div>

        {/* Main content - flexible width */}
        <main className="flex-1 overflow-y-auto ">
          <div className="p-6 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>

  );
};

export default SidebarLayout;
