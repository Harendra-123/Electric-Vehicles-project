import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Wallet, CreditCard, MapPin, Route, CheckCircle } from "lucide-react";

import { getPaymentDetails } from "../../services/rideApi";

import "./PaymentDetails.css";

const defaultPayment = {
  ride_id: 0,
  amount: 0,
  payment_method: "UPI",
  payment_status: "paid",
  pickup: "Current location",
  destination: "Destination",
  fare: 0,
  ride_status: "completed",
};

function PaymentDetails() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(defaultPayment);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const response = await getPaymentDetails(rideId);
        const paymentData = response?.payments?.[0] || response?.payment || defaultPayment;
        setPayment({ ...defaultPayment, ...paymentData });
      } catch (error) {
        console.error("Failed to load payment details", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [rideId]);

  return (
    <div className="payment-details-page">
      <header className="payment-details-header">
        <button type="button" className="back-button" onClick={() => navigate("/user/payment")}>← Back</button>
        <div>
          <p className="section-tag">Payment</p>
          <h1>Payment details</h1>
        </div>
      </header>

      {loading ? (
        <div className="payment-details-loading">Loading payment details...</div>
      ) : (
        <main className="payment-details-content">
          <section className="payment-details-card">
            <div className="payment-details-top">
              <div>
                <p className="amount-label">Paid amount</p>
                <h2>₹{payment.amount || payment.fare || 0}</h2>
              </div>
              <span className={`payment-status ${String(payment.payment_status || "paid").toLowerCase()}`}>
                {String(payment.payment_status || "paid").toUpperCase()}
              </span>
            </div>
          </section>

          <section className="payment-detail-grid">
            <article className="detail-card">
              <div className="card-icon"><Wallet size={18} /></div>
              <div>
                <span>Payment method</span>
                <strong>{payment.payment_method || "UPI"}</strong>
              </div>
            </article>

            <article className="detail-card">
              <div className="card-icon"><MapPin size={18} /></div>
              <div>
                <span>Pickup</span>
                <strong>{payment.pickup || "Current location"}</strong>
              </div>
            </article>

            <article className="detail-card">
              <div className="card-icon"><Route size={18} /></div>
              <div>
                <span>Destination</span>
                <strong>{payment.destination || "Destination"}</strong>
              </div>
            </article>

            <article className="detail-card">
              <div className="card-icon"><CheckCircle size={18} /></div>
              <div>
                <span>Ride status</span>
                <strong>{payment.ride_status || "completed"}</strong>
              </div>
            </article>
          </section>
        </main>
      )}
    </div>
  );
}

export default PaymentDetails;
