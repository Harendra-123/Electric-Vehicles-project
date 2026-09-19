import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CarFront,
  History,
  UserRound,
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

import "./UserNavigation.css";

const navigationItems = [
  {
    label: "Ride",
    desktopLabel: "Dashboard",
    path: "/user/home",
    icon: LayoutDashboard,
  },
  {
    label: "History",
    desktopLabel: "Ride History",
    path: "/user/history",
    icon: History,
  },
  {
    label: "Profile",
    desktopLabel: "Profile",
    path: "/user/profile",
    icon: UserRound,
  },
];

const desktopItems = [
  {
    label: "Dashboard",
    path: "/user/home",
    icon: LayoutDashboard,
  },
  {
    label: "Ride History",
    path: "/user/history",
    icon: History,
  },
  {
    label: "Payments",
    path: "/user/payment",
    icon: CreditCard,
  },
  {
    label: "Profile",
    path: "/user/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    path: "/user/settings",
    icon: Settings,
  },
];

function UserNavigation() {
  const location = useLocation();
  const isProfilePage = location.pathname === "/user/profile";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <aside className="user-sidebar">
        <div className="user-sidebar-logo">
          <div className="user-logo-icon">
            <CarFront size={22} />
          </div>

          <div>
            <h2>EV Ride</h2>
            <span>Electric Mobility</span>
          </div>
        </div>

        <div className="user-menu-title">MENU</div>

        <nav className="user-sidebar-menu">
          {desktopItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `user-sidebar-link ${
                    isActive ? "user-sidebar-link-active" : ""
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="user-sidebar-bottom">
          {!isProfilePage && (
            <button type="button" className="user-logout-btn" onClick={handleLogout}>
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          )}

          <div className="user-mini-profile">
            <div className="user-avatar">H</div>

            <div>
              <strong>Harendra</strong>
              <span>Passenger</span>
            </div>
          </div>
        </div>
      </aside>

      <nav className="user-bottom-navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? "mobile-nav-active" : ""}`
              }
            >
              <Icon size={22} strokeWidth={2.2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

export default UserNavigation;