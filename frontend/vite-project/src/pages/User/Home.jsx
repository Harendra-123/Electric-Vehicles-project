import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CarFront,
  Clock3,
  CreditCard,
  MapPin,
  Navigation,
  Route,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";

import { bookRide, getUserProfile, getUserRideHistory } from "../../services/rideApi";

import "./Home.css";

const fallbackRides = [
  {
    id: 1,
    pickup: "Bhopal City Center",
    destination: "Sagar Institute",
    fare: 228,
    status: "completed",
    created_at: "2026-09-15T09:00:00.000Z",
  },
  {
    id: 2,
    pickup: "MP Nagar",
    destination: "Bhopal Airport",
    fare: 310,
    status: "completed",
    created_at: "2026-09-13T18:20:00.000Z",
  },
  {
    id: 3,
    pickup: "Current Location",
    destination: "Railway Station",
    fare: 260,
    status: "requested",
    created_at: "2026-09-16T12:05:00.000Z",
  },
];

const defaultUser = {
  name: "Rider",
  email: "rider@voltride.com",
  phone: "+91 98765 43210",
};

const getDemoRideTarget = () => {
  try {
    return JSON.parse(localStorage.getItem("demoRideTarget") || '{"driver_id":3,"vehicle_id":8}');
  } catch (error) {
    return { driver_id: 3, vehicle_id: 8 };
  }
};

function Home() {
  const [user, setUser] = useState(defaultUser);
  const [rideHistory, setRideHistory] = useState([]);
  const [destination, setDestination] = useState("Sagar Institute of Science");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [locationLoading, setLocationLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser({ ...defaultUser, ...JSON.parse(storedUser) });
      } catch (error) {
        console.error("Invalid stored user data", error);
      }
    }

    const loadUserProfile = async () => {
      try {
        const profileResponse = await getUserProfile();

        if (profileResponse?.user) {
          setUser({ ...defaultUser, ...profileResponse.user });
          localStorage.setItem("user", JSON.stringify(profileResponse.user));
        }
      } catch (error) {
        console.error("Profile fetch failed", error);
      }
    };

    const loadRideHistory = async () => {
      try {
        const result = await getUserRideHistory();

        if (result?.rides?.length) {
          setRideHistory(result.rides);
          localStorage.setItem("userRideHistory", JSON.stringify(result.rides));
          return;
        }

        const savedRideHistory = JSON.parse(localStorage.getItem("userRideHistory") || "[]");
        if (savedRideHistory.length) {
          setRideHistory(savedRideHistory);
          return;
        }

        setRideHistory([]);
      } catch (error) {
        console.error("Failed to fetch ride history", error);
        const savedRideHistory = JSON.parse(localStorage.getItem("userRideHistory") || "[]");
        setRideHistory(savedRideHistory.length ? savedRideHistory : []);
      }
    };

    loadUserProfile();
    loadRideHistory();

    const intervalId = setInterval(() => {
      loadRideHistory();
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  const normalizeRideStatus = (ride) => {
    return String(ride?.status ?? ride?.ride_status ?? "").toLowerCase();
  };

  const stats = useMemo(() => {
    const totalSpend = rideHistory.reduce((sum, ride) => {
      const amount = Number(ride.fare ?? ride.payment_amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    const completedCount = rideHistory.filter(
      (ride) => normalizeRideStatus(ride) === "completed"
    ).length;

    const activeCount = rideHistory.filter((ride) => {
      const status = normalizeRideStatus(ride);
      return ["requested", "accepted", "started"].includes(status);
    }).length;

    return {
      totalRides: rideHistory.length,
      totalSpend,
      completedCount,
      activeCount,
    };
  }, [rideHistory]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationLoading(false);
        setBookingMessage("Current location updated successfully.");
      },
      () => {
        setLocationLoading(false);
        alert("Unable to get your current location.");
      }
    );
  };

  const handleBookRide = async () => {
    if (!destination) {
      alert("Please select your destination.");
      return;
    }

    const demoTarget = getDemoRideTarget();

    setBookingLoading(true);
    setBookingMessage("");

    const ridePayload = {
      driver_id: null,
      vehicle_id: demoTarget.vehicle_id || 8,
      pickup: "Current Location",
      destination,
      distance: 12.6,
      fare: paymentMethod === "card" ? 320 : paymentMethod === "cash" ? 280 : 300,
    };

    try {
      const response = await bookRide(ridePayload);
      const createdRide = {
        id: response?.rideId ?? Date.now(),
        pickup: ridePayload.pickup,
        destination: ridePayload.destination,
        fare: ridePayload.fare,
        status: "requested",
        created_at: new Date().toISOString(),
      };

      const nextRideHistory = [createdRide, ...rideHistory];
      setRideHistory(nextRideHistory);
      localStorage.setItem("userRideHistory", JSON.stringify(nextRideHistory));
      setBookingMessage(response?.message || "Ride requested successfully.");
    } catch (error) {
      const fallbackRide = {
        id: Date.now(),
        pickup: ridePayload.pickup,
        destination: ridePayload.destination,
        fare: ridePayload.fare,
        status: "requested",
        created_at: new Date().toISOString(),
      };

      const nextRideHistory = [fallbackRide, ...rideHistory];
      setRideHistory(nextRideHistory);
      localStorage.setItem("userRideHistory", JSON.stringify(nextRideHistory));
      setBookingMessage(
        error?.response?.data?.message ||
          "Ride request queued locally. Backend is not ready for booking yet."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const recentTrips = rideHistory.slice(0, 3);

  const routeMap = useMemo(() => ({
    "Railway Station": {
      label: "Railway Station",
      path: "M 18 64 C 34 62, 42 48, 54 44 S 76 32, 88 26",
      startX: 18,
      startY: 64,
      endX: 88,
      endY: 26,
    },
    "Sagar Institute of Science": {
      label: "Sagar Institute of Science",
      path: "M 18 64 C 30 58, 40 52, 48 52 S 68 48, 78 42 S 88 36, 94 28",
      startX: 18,
      startY: 64,
      endX: 94,
      endY: 28,
    },
    "MP Nagar": {
      label: "MP Nagar",
      path: "M 18 64 C 26 70, 38 72, 52 66 S 72 58, 84 52",
      startX: 18,
      startY: 64,
      endX: 84,
      endY: 52,
    },
    "Bhopal Airport": {
      label: "Bhopal Airport",
      path: "M 18 64 C 30 70, 41 78, 52 74 S 70 66, 84 60 S 90 50, 96 42",
      startX: 18,
      startY: 64,
      endX: 96,
      endY: 42,
    },
  }), []);

  const selectedRoute = routeMap[destination] || routeMap["Sagar Institute of Science"];

  const getTripProgressIndex = (status) => {
    const normalized = String(status || "").toLowerCase();
    const stepMap = {
      requested: 0,
      accepted: 1,
      started: 2,
      arrived: 3,
      completed: 4,
    };

    return stepMap[normalized] ?? -1;
  };

  const liveRide = useMemo(() => {
    return rideHistory.find((ride) => {
      const status = normalizeRideStatus(ride);
      return ["accepted", "started"].includes(status);
    }) || null;
  }, [rideHistory]);

  const liveRideStatus = liveRide ? normalizeRideStatus(liveRide) : "";
  const liveStepIndex = getTripProgressIndex(liveRideStatus);
  const tripProgressValue = liveRide ? `${Math.max(1, liveStepIndex + 1)}/5` : "0/5";

  const liveSteps = [
    { key: "requested", label: "Requested" },
    { key: "accepted", label: "Driver assigned" },
    { key: "started", label: "Trip started" },
    { key: "arrived", label: "Reached destination" },
    { key: "completed", label: "Payment complete" },
  ];

  const liveRideId = liveRide ? (liveRide.id ?? liveRide.ride_id ?? null) : null;
  const liveRideDetailPath = liveRideId ? `/user/ride/${liveRideId}` : "/user/history";

  const liveRideSummary = liveRide
    ? `${liveRide.pickup || "Current Location"} → ${liveRide.destination || "Destination"}`
    : "No trip in progress";

  const liveTrackLabel = liveRide
    ? normalizeRideStatus(liveRide) === "accepted"
      ? "Driver accepted your ride • tracking started"
      : "Ride in progress • live tracking active"
    : "No active ride";

  const activeRideCount = rideHistory.filter((ride) => {
    const status = normalizeRideStatus(ride);
    return ["requested", "accepted", "started"].includes(status);
  }).length;

  const latestRide = rideHistory[0] || null;
  const latestRideStatus = latestRide ? normalizeRideStatus(latestRide) : "";
  const tripCompletedMessage =
    !liveRide && latestRideStatus === "completed"
      ? "Trip completed successfully — payment summary is ready."
      : "";

  return (
    <div className="user-dashboard-page">
      <section className="user-dashboard-header">
        <div>
          <p className="eyebrow">Good morning</p>
          <h1>Hi {user.name?.split(" ")[0] || "Rider"} 👋</h1>
        </div>

        <button className="primary-cta" onClick={handleBookRide} disabled={bookingLoading}>
          <CarFront size={18} />
          {bookingLoading ? "Booking..." : "Book ride"}
        </button>
      </section>

      <section className="user-summary-grid">
        <div className="summary-card accent">
          <div className="summary-icon">
            <Route size={20} />
          </div>
          <div>
            <span>Total rides</span>
            <strong>{stats.totalRides}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">
            <Wallet size={20} />
          </div>
          <div>
            <span>Spend</span>
            <strong>₹{stats.totalSpend}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Active</span>
            <strong>{stats.activeCount}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple">
            <Star size={20} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{stats.completedCount}</strong>
          </div>
        </div>
      </section>

      <section className="quick-book-panel">
        <div className="panel-header">
          <div>
            <p>Plan your trip</p>
            <h2>Where to?</h2>
          </div>
          <div className="travel-badge">
            <Sparkles size={14} />
            <span>EV ready</span>
          </div>
        </div>

        <div className="pickup-box">
          <div className="route-icon pickup">
            <MapPin size={15} fill="currentColor" />
          </div>
          <div className="route-content">
            <label>Pickup</label>
            <button type="button" onClick={getCurrentLocation}>
              {locationLoading ? "Locating..." : "Current location"}
            </button>
          </div>
        </div>

        <div className="route-line" />

        <div className="pickup-box">
          <div className="route-icon destination">
            <Navigation size={15} fill="currentColor" />
          </div>
          <div className="route-content">
            <label>Destination</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)}>
              <option value="">Select destination</option>
              <option value="Railway Station">Railway Station</option>
              <option value="Sagar Institute of Science">Sagar Institute of Science</option>
              <option value="MP Nagar">MP Nagar</option>
              <option value="Bhopal Airport">Bhopal Airport</option>
            </select>
          </div>
        </div>

        <div className={`route-preview ${destination ? "route-preview-visible" : ""}`}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Ride route preview">
            <path d={selectedRoute.path} className="best-route-path" />
            <circle cx={selectedRoute.startX} cy={selectedRoute.startY} r={2.4} className="route-point start-point" />
            <circle cx={selectedRoute.endX} cy={selectedRoute.endY} r={2.8} className="route-point end-point" />
          </svg>
          <div className="route-preview-label">Fastest route to {selectedRoute.label}</div>
        </div>

        {liveRide && (
          <div className="live-tracking-banner">
            <span className="tracking-indicator" />
            <span>{liveTrackLabel}</span>
          </div>
        )}

        {liveRide && (
          <div className="live-trip-card">
            <div className="live-trip-header">
              <div>
                <p>Current trip</p>
                <h3>{liveRide.destination || "Ride"}</h3>
              </div>
              <span className={`ride-status ${(normalizeRideStatus(liveRide) || "requested").toLowerCase()}`}>
                {String(normalizeRideStatus(liveRide) || "REQUESTED").toUpperCase()}
              </span>
            </div>

            <div className="live-trip-route-summary">{liveRideSummary}</div>

            <div className="live-trip-steps">
              {liveSteps.map((step, index) => (
                <div key={step.key} className={`trip-step ${index <= liveStepIndex ? "active" : ""}`}>
                  <span className="trip-step-dot" />
                  <div>
                    <strong>{step.label}</strong>
                    <small>{index === liveStepIndex ? "Current status" : index < liveStepIndex ? "Done" : "Pending"}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="trip-progress-pill">Progress {tripProgressValue}</div>

            <button type="button" className="track-live-ride-button" onClick={() => (window.location.href = liveRideDetailPath)}>
              Track live ride
            </button>
          </div>
        )}

        {tripCompletedMessage && (
          <div className="trip-complete-banner">{tripCompletedMessage}</div>
        )}

        {bookingMessage && <div className="booking-message">{bookingMessage}</div>}
      </section>

      <section className="user-content-grid">
        <div className="recent-rides card-box">
          <div className="card-header">
            <h3>Recent rides</h3>
            <button type="button" onClick={() => (window.location.href = "/user/history")}>
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="ride-list">
            {recentTrips.map((ride) => (
              <div key={ride.id ?? ride.ride_id} className="ride-item">
                <div className="ride-dot" />
                <div className="ride-main">
                  <div className="ride-title-row">
                    <strong>{ride.destination || "Ride"}</strong>
                    <span className={`ride-status ${(ride.status || ride.ride_status || "completed").toLowerCase()}`}>
                      {(ride.status || ride.ride_status || "completed").toUpperCase()}
                    </span>
                  </div>
                  <p>{ride.pickup || "Current Location"}</p>
                </div>
                <div className="ride-price">₹{ride.fare ?? ride.payment_amount ?? 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-summary card-box">
          <div className="card-header">
            <h3>Profile</h3>
          </div>

          <div className="user-profile-card">
            <div className="avatar-circle">
              {(user.name || "R").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <p>{user.email}</p>
              <small>{user.phone || "Phone not added"}</small>
            </div>
          </div>

          <div className="mini-stats">
            <div>
              <span>Trips</span>
              <strong>{stats.totalRides}</strong>
            </div>
            <div>
              <span>Avg fare</span>
              <strong>₹{stats.totalRides ? Math.round(stats.totalSpend / stats.totalRides) : 0}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;