import React, { useEffect, useState } from "react";
import { CarFront, Clock3, MapPin, Navigation, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getUserRideHistory } from "../../services/rideApi";

import "./History.css";

const fallbackHistory = [
  {
    ride_id: 1001,
    destination: "Sagar Institute of Science",
    pickup: "Current Location",
    fare: 228,
    ride_status: "completed",
    payment_status: "paid",
    payment_method: "UPI",
  },
  {
    ride_id: 1002,
    destination: "MP Nagar",
    pickup: "Bhopal City Center",
    fare: 310,
    ride_status: "completed",
    payment_status: "paid",
    payment_method: "Card",
  },
  {
    ride_id: 1003,
    destination: "Railway Station",
    pickup: "Current Location",
    fare: 260,
    ride_status: "requested",
    payment_status: "pending",
    payment_method: "Cash",
  },
];

function RideHistory() {
  const navigate = useNavigate();
  const [rides, setRides] = useState(fallbackHistory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await getUserRideHistory();

        if (result?.rides?.length) {
          setRides(result.rides);
        }
      } catch (error) {
        console.error("History fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="history-page">
      <header className="history-header">
        <p className="history-eyebrow">Trips</p>
        <h1>Ride History</h1>
        <p>Your past and upcoming rides</p>
      </header>

      <main className="history-content">
        {loading ? (
          <div className="history-empty">
            <CarFront size={48} className="empty-car" />
            <h2>Loading your rides...</h2>
          </div>
        ) : rides.length === 0 ? (
          <div className="history-empty">
            <CarFront size={48} className="empty-car" />
            <h2>No rides yet</h2>
            <p>Your recent trips will appear here.</p>
          </div>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <article key={ride.ride_id ?? ride.id} className="ride-history-card">
                <div className="ride-card-top">
                  <div>
                    <h3>{ride.destination || "Ride destination"}</h3>
                    <p>
                      {ride.pickup || "Current Location"} → {ride.destination || "Destination"}
                    </p>
                  </div>
                  <span className={`ride-status ${(ride.ride_status || "completed").toLowerCase()}`}>
                    {(ride.ride_status || "completed").toUpperCase()}
                  </span>
                </div>

                <div className="ride-card-meta">
                  <span>
                    <MapPin size={13} />
                    {ride.pickup || "Current Location"}
                  </span>
                  <span>
                    <Navigation size={13} />
                    {ride.destination || "Destination"}
                  </span>
                </div>

                <div className="ride-card-bottom">
                  <span>
                    <Wallet size={13} />
                    ₹{ride.fare ?? ride.amount ?? 0}
                  </span>
                  <span>
                    <Clock3 size={13} />
                    {ride.payment_method || "UPI"}
                  </span>
                  <span>{ride.payment_status || "Paid"}</span>
                </div>

                <button
                  type="button"
                  className="ride-details-link"
                  onClick={() => navigate(`/user/ride/${ride.ride_id ?? ride.id}`)}
                >
                  View details
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default RideHistory;