import React, { useEffect, useState } from "react";

import {
  Car,
  Wallet,
  UserCircle,
  Tag,
  FileText,
  Mail,
  Phone,
  CheckCircle,
  LogOut,
  Star,
  Pencil,
} from "lucide-react";

import { getDriverProfile } from "../../services/rideApi";

import "./Profile.css";

const Profile = () => {
  const [driver, setDriver] = useState({
    name: "Driver",
    email: "driver@voltride.com",
    phone: "+91 00000 00000",
    rating: 4.7,
    totalRides: 0,
    vehicle: "Tata Nexon EV",
    vehicleNumber: "KA01EV0000",
    license: "DL00000000",
    status: "Approved",
  });

  useEffect(() => {
    const loadDriverProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await getDriverProfile();

        if (response?.driver) {
          const driverProfile = response.driver;
          const nextDriver = {
            name: driverProfile.name || storedUser.name || "Driver",
            email: driverProfile.email || storedUser.email || "driver@voltride.com",
            phone: driverProfile.phone || storedUser.phone || "+91 00000 00000",
            rating: Number(storedUser.rating || 4.7),
            totalRides: Number(storedUser.totalRides || 0),
            vehicle: storedUser.vehicle || "Tata Nexon EV",
            vehicleNumber: storedUser.vehicleNumber || "KA01EV0000",
            license: driverProfile.license_no || storedUser.license || "DL00000000",
            status: storedUser.status || "Approved",
          };

          setDriver(nextDriver);
          localStorage.setItem("user", JSON.stringify({ ...storedUser, ...nextDriver }));
        } else {
          const nextDriver = {
            name: storedUser.name || "Driver",
            email: storedUser.email || "driver@voltride.com",
            phone: storedUser.phone || "+91 00000 00000",
            rating: Number(storedUser.rating || 4.7),
            totalRides: Number(storedUser.totalRides || 0),
            vehicle: storedUser.vehicle || "Tata Nexon EV",
            vehicleNumber: storedUser.vehicleNumber || "KA01EV0000",
            license: storedUser.license || "DL00000000",
            status: storedUser.status || "Approved",
          };
          setDriver(nextDriver);
        }
      } catch (error) {
        console.error("Failed to load driver profile", error);
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setDriver({
          name: storedUser.name || "Driver",
          email: storedUser.email || "driver@voltride.com",
          phone: storedUser.phone || "+91 00000 00000",
          rating: Number(storedUser.rating || 4.7),
          totalRides: Number(storedUser.totalRides || 0),
          vehicle: storedUser.vehicle || "Tata Nexon EV",
          vehicleNumber: storedUser.vehicleNumber || "KA01EV0000",
          license: storedUser.license || "DL00000000",
          status: storedUser.status || "Approved",
        });
      }
    };

    loadDriverProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="driver-profile-page">
      <aside className="driver-profile-sidebar">
        <div className="driver-profile-logo">
          <div className="driver-profile-logo-icon">
            <Car size={21} />
          </div>
          <span>VoltRide</span>
        </div>

        <nav className="driver-profile-sidebar-nav">
          <a href="/driver/dashboard" className="driver-profile-side-link">
            <Car size={20} />
            <span>Drive</span>
          </a>

          <a href="/driver/earnings" className="driver-profile-side-link">
            <Wallet size={20} />
            <span>Earnings</span>
          </a>

          <a href="/driver/profile" className="driver-profile-side-link active">
            <UserCircle size={20} />
            <span>Profile</span>
          </a>
        </nav>
      </aside>

      <main className="driver-profile-main">
        <section className="driver-profile-header">
          <div className="driver-profile-avatar">
            {driver.name ? driver.name.charAt(0).toUpperCase() : "D"}
          </div>

          <h1>{driver.name}</h1>

          <div className="driver-profile-rating">
            <Star size={22} fill="currentColor" />
            <span>{driver.rating}</span>
            <span>•</span>
            <span>{driver.totalRides} rides</span>
          </div>
        </section>

        <section className="driver-profile-content">
          <div className="driver-profile-card">
            <h2>Vehicle</h2>

            <div className="driver-profile-row">
              <Car size={27} />
              <span>{driver.vehicle}</span>
            </div>

            <div className="driver-profile-row">
              <Tag size={27} />
              <span>{driver.vehicleNumber}</span>
            </div>

            <div className="driver-profile-row">
              <FileText size={27} />
              <span>License: {driver.license}</span>
            </div>
          </div>

          <div className="driver-profile-card">
            <h2>Contact</h2>

            <div className="driver-profile-row">
              <Mail size={27} />
              <span>{driver.email}</span>
            </div>

            <div className="driver-profile-row">
              <Phone size={27} />
              <span>{driver.phone}</span>
            </div>
          </div>

          <div className="driver-account-status">
            <h2>Account Status</h2>

            <div className="driver-status-row">
              <CheckCircle size={27} />
              <span>{driver.status} ✓</span>
            </div>
          </div>

          <button className="driver-edit-button" onClick={() => (window.location.href = "/driver/profile/edit")}>
            <Pencil size={18} />
            <span>Edit profile</span>
          </button>

          <button className="driver-signout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </section>
      </main>

      <nav className="driver-profile-mobile-nav">
        <a href="/driver/dashboard" className="driver-profile-mobile-link">
          <Car size={25} />
          <span>Drive</span>
        </a>

        <a href="/driver/earnings" className="driver-profile-mobile-link">
          <Wallet size={25} />
          <span>Earnings</span>
        </a>

        <a href="/driver/profile" className="driver-profile-mobile-link active">
          <UserCircle size={25} />
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
};

export default Profile;