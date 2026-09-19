import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUserProfile, updateUserProfile } from "../../services/rideApi";

import "./ProfileEdit.css";

const defaultUser = {
  name: "",
  email: "",
  phone: "",
};

function ProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setForm({ ...defaultUser, ...JSON.parse(storedUser) });
        }

        const response = await getUserProfile();
        if (response?.user) {
          const profile = response.user;
          setForm({ ...defaultUser, ...profile });
          localStorage.setItem("user", JSON.stringify(profile));
        }
      } catch (error) {
        console.error("Failed to load profile for edit", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await updateUserProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
      });

      if (response?.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      navigate("/user/profile");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Profile update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="user-profile-edit-page">
      <header className="profile-edit-header">
        <button type="button" className="back-button" onClick={() => navigate("/user/profile")}>
          ← Back
        </button>
        <div>
          <p className="section-tag">Profile</p>
          <h1>Edit profile</h1>
        </div>
      </header>

      <main className="profile-edit-content">
        {loading ? (
          <div className="profile-edit-loading">Loading profile...</div>
        ) : (
          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone || ""}
                onChange={handleChange}
                placeholder="Enter your phone"
              />
            </div>

            <button type="submit" className="save-profile-button" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default ProfileEdit;
