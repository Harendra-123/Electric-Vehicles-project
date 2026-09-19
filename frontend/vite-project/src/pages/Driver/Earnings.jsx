import React from "react";
import {
  Car,
  Wallet,
  UserCircle,
  TrendingUp,
  CreditCard,
  CalendarDays,
  ArrowUpRight,
  CircleDollarSign,
} from "lucide-react";

import "./Earnings.css";

const Earnings = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const driver = {
    name: storedUser.name || "Driver",
    monthlyEarning: Number(storedUser.monthlyEarning || 24850),
    weeklyEarning: Number(storedUser.weeklyEarning || 3420),
    totalTrips: Number(storedUser.totalTrips || storedUser.totalRides || 94),
    pendingPayout: Number(storedUser.pendingPayout || 1320),
    rating: Number(storedUser.rating || 4.7),
  };

  const weeklyBreakdown = [
    { day: "Mon", amount: Number(storedUser.weeklyBreakdown?.mon || 420) },
    { day: "Tue", amount: Number(storedUser.weeklyBreakdown?.tue || 560) },
    { day: "Wed", amount: Number(storedUser.weeklyBreakdown?.wed || 490) },
    { day: "Thu", amount: Number(storedUser.weeklyBreakdown?.thu || 710) },
    { day: "Fri", amount: Number(storedUser.weeklyBreakdown?.fri || 860) },
    { day: "Sat", amount: Number(storedUser.weeklyBreakdown?.sat || 980) },
    { day: "Sun", amount: Number(storedUser.weeklyBreakdown?.sun || 640) },
  ];

  const transactions =
    Array.isArray(storedUser.transactions) && storedUser.transactions.length > 0
      ? storedUser.transactions
      : [
          { id: "#RIDE1021", date: "Today, 10:40 AM", amount: 260, status: "Completed" },
          { id: "#RIDE1017", date: "Yesterday, 09:15 PM", amount: 410, status: "Pending" },
          { id: "#RIDE1008", date: "Mon, 08:25 AM", amount: 345, status: "Completed" },
          { id: "#RIDE0989", date: "Sun, 07:10 PM", amount: 510, status: "Completed" },
        ];

  const maxAmount = Math.max(...weeklyBreakdown.map((item) => item.amount));

  return (
    <div className="driver-earnings-page">
      <aside className="driver-earnings-sidebar">
        <div className="driver-earnings-logo">
          <div className="driver-earnings-logo-icon">
            <Car size={21} />
          </div>
          <span>VoltRide</span>
        </div>

        <nav className="driver-earnings-sidebar-nav">
          <a href="/driver/dashboard" className="driver-earnings-side-link">
            <Car size={20} />
            <span>Drive</span>
          </a>

          <a href="/driver/earnings" className="driver-earnings-side-link active">
            <Wallet size={20} />
            <span>Earnings</span>
          </a>

          <a href="/driver/profile" className="driver-earnings-side-link">
            <UserCircle size={20} />
            <span>Profile</span>
          </a>
        </nav>
      </aside>

      <main className="driver-earnings-main">
        <section className="driver-earnings-header">
          <div>
            <p className="driver-earnings-label">Earnings overview</p>
            <h1>₹{driver.monthlyEarning.toLocaleString()}</h1>
          </div>

          <div className="driver-earnings-mini-card">
            <TrendingUp size={18} />
            <span>+12.4% from last month</span>
          </div>
        </section>

        <section className="driver-earnings-stats">
          <div className="driver-earnings-card">
            <div className="driver-earnings-icon green">
              <Wallet size={22} />
            </div>
            <strong>₹{driver.weeklyEarning.toLocaleString()}</strong>
            <span>This Week</span>
          </div>

          <div className="driver-earnings-card">
            <div className="driver-earnings-icon blue">
              <Car size={22} />
            </div>
            <strong>{driver.totalTrips}</strong>
            <span>Trips</span>
          </div>

          <div className="driver-earnings-card">
            <div className="driver-earnings-icon orange">
              <CreditCard size={22} />
            </div>
            <strong>₹{driver.pendingPayout.toLocaleString()}</strong>
            <span>Pending Payout</span>
          </div>
        </section>

        <section className="driver-earnings-content">
          <div className="driver-earnings-panel chart-panel">
            <div className="panel-heading">
              <h2>Weekly earnings</h2>
              <CalendarDays size={18} />
            </div>

            <div className="driver-earnings-bars">
              {weeklyBreakdown.map((item) => (
                <div key={item.day} className="driver-earnings-bar-group">
                  <div className="driver-earnings-bar-wrap">
                    <div
                      className="driver-earnings-bar"
                      style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                    />
                  </div>
                  <span>{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="driver-earnings-panel payout-panel">
            <div className="panel-heading">
              <h2>Payment summary</h2>
              <CircleDollarSign size={18} />
            </div>

            <div className="payout-row">
              <span>Total earnings</span>
              <strong>₹{driver.monthlyEarning.toLocaleString()}</strong>
            </div>

            <div className="payout-row">
              <span>Commission</span>
              <strong>₹{(driver.monthlyEarning * 0.15).toLocaleString()}</strong>
            </div>

            <div className="payout-row">
              <span>Net payout</span>
              <strong>₹{(driver.monthlyEarning - driver.monthlyEarning * 0.15).toLocaleString()}</strong>
            </div>

            <button type="button" className="driver-earnings-button">
              <ArrowUpRight size={16} />
              Withdraw now
            </button>
          </div>
        </section>

        <section className="driver-earnings-panel transactions-panel">
          <div className="panel-heading">
            <h2>Recent rides</h2>
            <span className="transaction-count">{transactions.length} rides</span>
          </div>

          <div className="transaction-list">
            {transactions.map((item) => (
              <div key={item.id || `${item.date}-${item.amount}`} className="transaction-item">
                <div>
                  <strong>{item.id}</strong>
                  <p>{item.date}</p>
                </div>

                <div className="transaction-right">
                  <strong>₹{item.amount}</strong>
                  <span className={item.status === "Pending" ? "pending" : "completed"}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="driver-earnings-mobile-nav">
        <a href="/driver/dashboard" className="driver-earnings-mobile-link">
          <Car size={25} />
          <span>Drive</span>
        </a>

        <a href="/driver/earnings" className="driver-earnings-mobile-link active">
          <Wallet size={25} />
          <span>Earnings</span>
        </a>

        <a href="/driver/profile" className="driver-earnings-mobile-link">
          <UserCircle size={25} />
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
};

export default Earnings;
