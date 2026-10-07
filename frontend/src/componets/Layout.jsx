import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";


const Layout = () => {
  // Retrieve saved user object from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="d-flex min-vh-100">
      {/* Permanent Sidebar on the left */}
      <Sidebar />

      {/* Main container */}
      <div className="d-flex flex-column flex-grow-1 bg-light">
        {/* Top Header */}
        <Header user={user} />

        {/* Dynamic page content */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;