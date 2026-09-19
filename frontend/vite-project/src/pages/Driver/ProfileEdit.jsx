import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDriverProfile, updateDriverProfile } from "../../services/rideApi";

import "./ProfileEdit.css";

const defaultDriver = {
  name: "",
  email: "",
  phone: "",
  license_no: "",
};

function DriverProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultDriver);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (storedUser) {
          setForm({
            ...defaultDriver,
            name: storedUser.name || "",
            email: storedUser.email || "",
            phone: storedUser.phone || "",
            license_no: storedUser.license || "",
          });
        }

        const response = await getDriverProfile();
        if (response?.driver) {
          const profile = response.driver;
          const nextForm = {
            name: profile.name || storedUser.name || "",
            email: profile.email || storedUser.email || "",
            phone: profile.phone || storedUser.phone || "",
            license_no: profile.license_no || storedUser.license || "",
          };

          setForm(nextForm);
          localStorage.setItem("user", JSON.stringify({ ...storedUser, ...nextForm, license: nextForm.license_no }));
        }
      } catch (error) {
        console.error("Failed to load driver profile", error);
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
      const response = await updateDriverProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        license_no: form.license_no,
      });

      if (response?.driver) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...storedUser,
          name: response.driver.name,
          email: response.driver.email,
          phone: response.driver.phone,
          license: response.driver.license_no,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      navigate("/driver/profile");
    } catch (error) {
      console.error("Failed to update driver profile", error);
      alert("Profile update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="driver-profile-edit-page">
      <header className="driver-profile-edit-header">
        <button type="button" className="back-button" onClick={() => navigate("/driver/profile")}>← Back</button>
        <div>
          <p className="section-tag">Driver</p>
          <h1>Edit profile</h1>
        </div>
      </header>

      <main className="driver-profile-edit-content">
        {loading ? (
          <div className="driver-profile-edit-loading">Loading profile...</div>
        ) : (
          <form className="driver-profile-edit-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="license_no">License number</label>
              <input id="license_no" name="license_no" type="text" value={form.license_no} onChange={handleChange} />
            </div>

            <button type="submit" className="save-driver-profile-button" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default DriverProfileEdit;
