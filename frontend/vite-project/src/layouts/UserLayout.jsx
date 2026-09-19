import React from "react";
import { Outlet } from "react-router-dom";

import UserNavigation from "../components/UserNavigation/UserNavigation";

import "./UserLayout.css";

function UserLayout() {
  return (
    <div className="user-layout">
      <UserNavigation />

      <main className="user-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;