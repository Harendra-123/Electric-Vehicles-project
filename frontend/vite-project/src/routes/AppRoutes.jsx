import React from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";

import Dashboard from "../pages/Admin/Dashboard";
import DriverManagement from "../pages/Admin/DriverManagement";
import RideManagement from "../pages/Admin/RideManagement";
import Settings from "../pages/Admin/Settings";

import DriverDashboard from "../pages/Driver/Dashboard";
import DriverEarnings from "../pages/Driver/Earnings";
import Profile from "../pages/Driver/Profile";
import DriverProfileEdit from "../pages/Driver/ProfileEdit";
import DriverPaymentComplete from "../pages/Driver/PaymentComplete";

import UserLayout from "../layouts/UserLayout";
import UserProfile from "../pages/User/Profile";
import Home from "../pages/User/Home";
import RideHistory from "../pages/User/RideHistory";
import UserPayment from "../pages/User/Payment";
import UserPaymentDetails from "../pages/User/PaymentDetails";
import UserSettings from "../pages/User/Settings";
import UserProfileEdit from "../pages/User/ProfileEdit";
import RideDetails from "../pages/User/RideDetails";

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  if (["uder", "user", "rider", "passenger"].includes(value)) {
    return "user";
  }

  return value;
};

const RootRedirect = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const role = normalizeRole(storedUser?.role || "");

  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "driver") return <Navigate to="/driver/dashboard" replace />;
  if (role === "user") return <Navigate to="/user/home" replace />;

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />

        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/drivers" element={<DriverManagement />} />
        <Route path="/admin/rides" element={<RideManagement />} />
        <Route path="/admin/settings" element={<Settings />} />

        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/earnings" element={<DriverEarnings />} />
        <Route path="/driver/profile" element={<Profile />} />
        <Route path="/driver/profile/edit" element={<DriverProfileEdit />} />
        <Route path="/driver/payment-complete" element={<DriverPaymentComplete />} />

        <Route element={<UserLayout />}>
          <Route path="/user/home" element={<Home />} />
          <Route path="/user/history" element={<RideHistory />} />
          <Route path="/user/ride/:rideId" element={<RideDetails />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/profile/edit" element={<UserProfileEdit />} />
          <Route path="/user/payment" element={<UserPayment />} />
          <Route path="/user/payment/:rideId" element={<UserPaymentDetails />} />
          <Route path="/user/settings" element={<UserSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;