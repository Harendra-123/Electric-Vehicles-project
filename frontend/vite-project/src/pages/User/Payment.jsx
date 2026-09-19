import React, { useEffect, useState } from "react";
import { CreditCard, Wallet, Smartphone, ShieldCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getUserPayments, getUserProfile } from "../../services/rideApi";

import "./Payment.css";

const defaultUser = {
  name: "Demo Rider",
  email: "user@voltride.com",
};

const paymentMethods = [
  { id: 1, type: "UPI", detail: "harendra@okhdfcbank", icon: Smartphone },
  { id: 2, type: "Card", detail: "•••• 2456", icon: CreditCard },
  { id: 3, type: "Wallet", detail: "₹1,240 available", icon: Wallet },
];

function Payment() {
  const navigate = useNavigate();
  const [user, setUser] = useState(defaultUser);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileResponse = await getUserProfile();
        if (profileResponse?.user) {
          setUser({ ...defaultUser, ...profileResponse.user });
          localStorage.setItem("user", JSON.stringify(profileResponse.user));
        }

        const paymentsResponse = await getUserPayments();
        if (paymentsResponse?.payments) {
          setPayments(paymentsResponse.payments);
        }
      } catch (error) {
        console.error("Failed to fetch payment data", error);
      }
    };

    loadData();
  }, []);

  const totalPaid = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="user-payment-page">
      <header className="payment-header">
        <div>
          <p className="section-tag">Wallet</p>
          <h1>Payments</h1>
        </div>
      </header>

      <main className="payment-content">
        <section className="wallet-summary">
          <div>
            <span>Available balance</span>
            <strong>₹{totalPaid || 1240}</strong>
          </div>
          <button type="button">Add money</button>
        </section>

        <section className="payment-list">
          <h2>Payment methods</h2>

          {paymentMethods.map((method) => {
            const Icon = method.icon;

            return (
              <div key={method.id} className="payment-method-row">
                <div className="method-icon">
                  <Icon size={18} />
                </div>

                <div className="method-info">
                  <strong>{method.type}</strong>
                  <span>{method.detail}</span>
                </div>

                <ChevronRight size={18} className="method-arrow" />
              </div>
            );
          })}
        </section>

        <section className="payment-card">
          <div className="secure-badge">
            <ShieldCheck size={16} />
            <span>Secure payments</span>
          </div>

          <div className="summary-box">
            <div>
              <span>Last trip</span>
              <strong>₹{payments[0]?.amount || 228}</strong>
            </div>
            <div>
              <span>Account</span>
              <strong>{user.name}</strong>
            </div>
          </div>
        </section>

        <section className="payment-history-list">
          <h2>Recent payments</h2>

          {payments.length === 0 ? (
            <div className="payment-history-empty">No payment records found.</div>
          ) : (
            payments.map((payment) => (
              <button
                key={payment.id || payment.ride_id}
                type="button"
                className="payment-history-item"
                onClick={() => navigate(`/user/payment/${payment.ride_id ?? payment.id}`)}
              >
                <div>
                  <strong>{payment.destination || "Ride payment"}</strong>
                  <span>{payment.payment_method || "UPI"}</span>
                </div>
                <div className="payment-history-meta">
                  <span className="payment-meta-status">{payment.payment_status || "paid"}</span>
                  <strong>₹{payment.amount || payment.fare || 0}</strong>
                </div>
              </button>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Payment;
