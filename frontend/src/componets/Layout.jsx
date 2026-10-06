import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";


const Layout = () => {
  return (
    <div className="d-flex min-vh-100">
      {/* Permanent Sidebar on the left */}
      <Sidebar />

      {/* Main Container taking up remaining horizontal width */}
      <div className="d-flex flex-column flex-grow-1 bg-light">
        {/* Top Header */}

        {/* Main Workspace Area where pages render dynamically */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;