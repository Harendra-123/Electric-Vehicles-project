import React, { useEffect, useState } from "react";
import { Bell, Shield, SlidersHorizontal, User, ChevronRight } from "lucide-react";

import { getUserProfile } from "../../services/rideApi";

import "./Settings.css";

const defaultUser = {
  name: "Demo Rider",
  email: "user@voltride.com",
};

const settingsOptions = [
  { icon: User, label: "Account details", subtitle: "Edit profile and contact info" },
  { icon: Bell, label: "Notifications", subtitle: "Ride alerts and reminders" },
  { icon: Shield, label: "Privacy & security", subtitle: "Password and login security" },
  { icon: SlidersHorizontal, label: "Preferences", subtitle: "Theme, trip defaults, language" },
];

function Settings() {
  const [user, setUser] = useState(defaultUser);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({ ...defaultUser, ...parsedUser });
        }

        const response = await getUserProfile();
        if (response?.user) {
          const profileUser = response.user;
          setUser({ ...defaultUser, ...profileUser });
          localStorage.setItem("user", JSON.stringify(profileUser));
        }
      } catch (error) {
        console.error("Failed to load user settings", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="user-settings-page">
      <header className="settings-header">
        <div>
          <p className="section-tag">Account</p>
          <h1>Settings</h1>
        </div>
      </header>

      <main className="settings-content">
        <section className="settings-profile-card">
          <div className="settings-avatar">{(user.name || "R").charAt(0).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </section>

        <section className="settings-list">
          {settingsOptions.map((item, index) => {
            const Icon = item.icon;

            return (
              <button key={index} type="button" className="settings-item">
                <div className="settings-icon">
                  <Icon size={18} />
                </div>

                <div className="settings-text">
                  <strong>{item.label}</strong>
                  <span>{item.subtitle}</span>
                </div>

                <ChevronRight size={18} className="settings-arrow" />
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default Settings;
