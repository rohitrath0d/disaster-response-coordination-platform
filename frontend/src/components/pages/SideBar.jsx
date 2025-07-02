/* eslint-disable no-unused-vars */
import {
  LayoutDashboard,
  MapPin,
  FileText,
  // Radio,
  LogOut,
  User,
  LogIn,
  NewspaperIcon,
  TabletSmartphone,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar"
import { Button } from "../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  {
    name: "Dashboard",
    path: "/sidebar/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Resources",
    path: "/sidebar/resources",
    icon: MapPin,
  },
  {
    name: "Reports",
    path: "/sidebar/reports",
    icon: FileText,
  },
  {
    name: "Official Updates",
    path: "/sidebar/official-updates",
    icon: NewspaperIcon, // you can use `import { NewspaperIcon } from 'lucide-react'`
  },
  {
    name: "Social Media Feed",
    path: "/sidebar/social-feed",
    icon: TabletSmartphone, // you can use `import { NewspaperIcon } from 'lucide-react'`
  }

];

function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");
  const disasterId = localStorage.getItem("disasterId");

  const isLoggedIn = !!token || !!user;
  // const userName = user?.userName || "MockUser";
  const userName = user?.username || "MockUser";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Sidebar>
      {/* Sidebar Trigger Button - Always visible */}
      <SidebarTrigger>
        <Button
          variant="outline"
          className="fixed top-4 left-4 z-50 size-10 p-0"
        >
          ☰
        </Button>
      </SidebarTrigger>

      {/* Sidebar Content */}
      <SidebarContent
        side="left"
        className="w-64 fixed top-0 left-0 h-screen px-4 py-6 border-r bg-white z-40"
      >
        <SidebarHeader className="text-2xl font-bold">
          📡 Disaster Panel
        </SidebarHeader>

        <div className="flex flex-col gap-2">
          {navItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium",
                location.pathname.startsWith(path)
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <Icon className="w-4 h-4" /> {name}
            </Link>
          ))}
        </div>

        <SidebarFooter className="mt-auto border-t pt-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" /> 
              <span>{userName}</span>
              {/* <User className="w-4 h-4" /> <span>{username}</span> */}
            </div>


            {isLoggedIn ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                 <span> Logout </span>
              </Button>

            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-green-600 hover:underline"
              >
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
          </div>

        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

export default SideBar;
