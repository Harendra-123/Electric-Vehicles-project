import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Car, Wallet, Clock3, MapPin, ArrowRight } from "lucide-react";

import "./PaymentComplete.css";

const PaymentComplete = () => {
  const navigate = useNavigate();

  const summary = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("lastTripSummary") || "{}");
    } catch (error) {
      return {};
    }
  }, []);

  useEffect(() => {
    if (!summary?.fare && !summary?.destination) {
      const fallback = {
        pickup: "Current location",
        destination: "Sagar Institute of Science",
        fare: 320,
        distance: 12.6,
        status: "completed",
      };
      localStorage.setItem("lastTripSummary", JSON.stringify(fallback));
    }
  }, [summary]);

  const fare = Number(summary?.fare || 320);
  const distance = Number(summary?.distance || 12.6);
  const payout = Math.round(fare * 0.82);

  return (
    <div className="driver-payment-complete-page">
      <div className="driver-payment-complete-card">
        <div className="driver-payment-success-badge">
          <CheckCircle2 size={22} />
          Trip completed
        </div>

        <h1>Payment summary</h1>
        <p className="driver-payment-subtitle">Ride finished successfully.</p>

        <div className="driver-payment-amount-box">
          <span>Total fare</span>
          <strong>₹{fare}</strong>
        </div>

        <div className="driver-payment-grid">
          <div className="driver-payment-info-item">
            <div className="driver-payment-icon"><MapPin size={16} /></div>
            <div>
              <span>Route</span>
              <strong>{summary?.pickup || "Current location"} → {summary?.destination || "Destination"}</strong>
            </div>
          </div>

          <div className="driver-payment-info-item">
            <div className="driver-payment-icon"><Clock3 size={16} /></div>
            <div>
              <span>Distance</span>
              <strong>{distance.toFixed(1)} km</strong>
            </div>
          </div>

          <div className="driver-payment-info-item">
            <div className="driver-payment-icon"><Wallet size={16} /></div>
            <div>
              <span>Net payout</span>
              <strong>₹{payout}</strong>
            </div>
          </div>

          <div className="driver-payment-info-item">
            <div className="driver-payment-icon"><Car size={16} /></div>
            <div>
              <span>Status</span>
              <strong>{summary?.status || "completed"}</strong>
            </div>
          </div>
        </div>

        <div className="driver-payment-actions">
          <button type="button" className="driver-payment-primary" onClick={() => navigate("/driver/earnings")}>
            View earnings
            <ArrowRight size={16} />
          </button>
          <button type="button" className="driver-payment-secondary" onClick={() => navigate("/driver/dashboard")}>
            Back to drive
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentComplete;
