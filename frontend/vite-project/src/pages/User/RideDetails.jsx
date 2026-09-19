import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CarFront, Clock3, MapPin, Wallet, Route, UserRound } from "lucide-react";

import { getRideDetails } from "../../services/rideApi";

import "./RideDetails.css";

const defaultRide = {
  pickup: "Current location",
  destination: "Destination",
  distance: "0 km",
  fare: 0,
  status: "requested",
  vehicle_model: "EV Car",
  vehicle_number: "NA",
  driver_name: "Driver",
};

function RideDetails() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(defaultRide);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRide = async () => {
      try {
        const response = await getRideDetails(rideId);
        if (response?.ride) {
          setRide({ ...defaultRide, ...response.ride });
        }
      } catch (error) {
        console.error("Failed to load ride details", error);
      } finally {
        setLoading(false);
      }
    };

    loadRide();
  }, [rideId]);

  const statusLabel = String(ride.status || "requested").toUpperCase();

  return (
    <div className="ride-details-page">
      <header className="ride-details-header">
        <button type="button" className="back-button" onClick={() => navigate("/user/history")}>
          ← Back
        </button>

        <div>
          <p className="section-tag">Trip</p>
          <h1>Ride details</h1>
        </div>
      </header>

      {loading ? (
        <div className="ride-details-loading">Loading trip details...</div>
      ) : (
        <main className="ride-details-content">
          <section className="ride-summary-card">
            <div className="ride-summary-top">
              <div>
                <p className="route-label">Route</p>
                <h2>{ride.pickup || "Current location"}</h2>
                <small>to {ride.destination || "Destination"}</small>
              </div>

              <span className={`ride-status-pill ${String(ride.status || "requested").toLowerCase()}`}>
                {statusLabel}
              </span>
            </div>

            <div className="route-preview">
              <span className="route-point start" />
              <span className="route-line" />
              <span className="route-point end" />
            </div>
          </section>

          <section className="ride-details-grid">
            <article className="detail-card">
              <div className="card-icon"><MapPin size={18} /></div>
              <div>
                <span>Pickup</span>
                <strong>{ride.pickup || "Current location"}</strong>
              </div>
            </article>

            <article className="detail-card">
              <div className="card-icon"><Route size={18} /></div>
              <div>
                <span>Destination</span>
                <strong>{ride.destination || "Destination"}</strong>
              </div>
            </article>

            <article className="detail-card">
              <div className="card-icon"><CarFront size={18} /></div>
              <div>
                <span>Vehicle</span>
                <strong>{ride.vehicle_model || "EV Vehicle"}</strong>
              </div>
            </article>

            <article className="detail-card">
              <div className="card-icon"><UserRound size={18} /></div>
              <div>
                <span>Driver</span>
                <strong>{ride.driver_name || "Assigned driver"}</strong>
              </div>
            </article>
          </section>

          <section className="ride-summary-details">
            <div className="summary-row">
              <span><Clock3 size={15} /> Distance</span>
              <strong>{ride.distance || "0 km"}</strong>
            </div>

            <div className="summary-row">
              <span><Wallet size={15} /> Fare</span>
              <strong>₹{ride.fare || 0}</strong>
            </div>

            <div className="summary-row">
              <span><CarFront size={15} /> Vehicle number</span>
              <strong>{ride.vehicle_number || "NA"}</strong>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default RideDetails;
