import React, { useEffect, useMemo, useState } from "react";

import {
  Car,
  Wallet,
  UserCircle,
  Star,
  Search,
  Square,
  MapPin,
  CheckCircle2,
  Navigation,
  Clock3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

const routeDataMap = {
  "Railway Station": {
    label: "Railway Station",
    path: "M 20 78 C 30 68, 40 64, 52 58 S 70 40, 82 24",
    startX: 20,
    startY: 78,
    endX: 82,
    endY: 24,
  },
  "Sagar Institute of Science": {
    label: "Sagar Institute of Science",
    path: "M 16 78 C 28 72, 34 64, 52 56 S 74 46, 92 32",
    startX: 16,
    startY: 78,
    endX: 92,
    endY: 32,
  },
  "MP Nagar": {
    label: "MP Nagar",
    path: "M 18 76 C 30 68, 44 62, 58 58 S 74 44, 88 38",
    startX: 18,
    startY: 76,
    endX: 88,
    endY: 38,
  },
  "Bhopal Airport": {
    label: "Bhopal Airport",
    path: "M 16 74 C 30 70, 42 78, 52 72 S 68 62, 84 54 S 92 38, 96 24",
    startX: 16,
    startY: 74,
    endX: 96,
    endY: 24,
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState({
    name: "Driver",
    vehicle: "EV Vehicle",
    vehicleNumber: "NA",
    totalRides: 0,
    rating: 4.8,
    wallet: 0,
    todayEarning: 0,
    activeRides: 0,
    isOnline: false,
  });
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0.18);

  const activeRide = useMemo(() => {
    return (
      rideRequests.find((ride) => {
        const status = String(ride.status || "").toLowerCase();
        return ["accepted", "started"].includes(status);
      }) || null
    );
  }, [rideRequests]);

  const activeRideRoute = useMemo(() => {
    const destination = activeRide?.destination || "Sagar Institute of Science";
    return routeDataMap[destination] || routeDataMap["Sagar Institute of Science"];
  }, [activeRide]);

  const getRideDistance = (ride) => {
    const value = Number(ride?.distance ?? ride?.trip_distance ?? 0);
    return Number.isFinite(value) && value > 0 ? value : 8.4;
  };

  const getRideETA = (ride) => {
    const status = String(ride?.status || "").toLowerCase();
    const baseDistance = getRideDistance(ride);

    if (status === "started") {
      return Math.max(4, Math.round(baseDistance * 1.5));
    }

    if (status === "accepted") {
      return Math.max(7, Math.round(baseDistance * 2.2));
    }

    return Math.max(6, Math.round(baseDistance * 2.6));
  };

  const [etaCountdown, setEtaCountdown] = useState(0);

  useEffect(() => {
    if (!activeRide) {
      setEtaCountdown(0);
      setRouteProgress(0.18);
      return;
    }

    const nextEta = getRideETA(activeRide);
    setEtaCountdown(nextEta);

    const travelProgress = Math.min(
      0.92,
      Math.max(0.15, 1 - nextEta / Math.max(12, nextEta + 6))
    );
    setRouteProgress(travelProgress);

    const intervalId = setInterval(() => {
      setEtaCountdown((previous) => (previous > 0 ? previous - 1 : 0));
      setRouteProgress((previous) => Math.min(0.94, previous + 0.06));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [activeRide]);

  const carX =
    activeRideRoute.startX + (activeRideRoute.endX - activeRideRoute.startX) * routeProgress;
  const carY =
    activeRideRoute.startY + (activeRideRoute.endY - activeRideRoute.startY) * routeProgress;

  const loadDashboard = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const [summaryResponse, requestsResponse, availabilityResponse] = await Promise.all([
        getDriverDashboardData(),
        getDriverRideRequests(),
        getDriverAvailability(),
      ]);

      const summary = summaryResponse?.summary || {};
      const nextDriver = {
        name: summary.name || storedUser.name || "Driver",
        vehicle: summary.vehicle_name || storedUser.vehicle || "EV Vehicle",
        vehicleNumber: summary.vehicle_number || storedUser.vehicleNumber || "NA",
        totalRides: Number(summary.total_rides || 0),
        rating: Number(summary.rating || 4.8),
        wallet: Number(summary.wallet || 0),
        todayEarning: Number(summary.todayEarning || 0),
        activeRides: Number(summary.active_rides || 0),
        isOnline: availabilityResponse?.is_online ?? Boolean(summary.is_online),
      };

      setDriver(nextDriver);
      setRideRequests(requestsResponse?.requests || []);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          ...nextDriver,
        })
      );
    } catch (error) {
      console.error("Failed to fetch driver dashboard data", error);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setDriver({
        name: storedUser.name || "Driver",
        vehicle: storedUser.vehicle || "EV Vehicle",
        vehicleNumber: storedUser.vehicleNumber || "NA",
        totalRides: Number(storedUser.totalRides || 0),
        rating: Number(storedUser.rating || 4.8),
        wallet: Number(storedUser.wallet || 0),
        todayEarning: Number(storedUser.todayEarning || 0),
        activeRides: Number(storedUser.activeRides || 0),
        isOnline: Boolean(storedUser.isOnline),
      });
    }
  };

  useEffect(() => {
    loadDashboard();

    const intervalId = setInterval(() => {
      loadDashboard();
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  const handleAvailabilityToggle = async () => {
    setLoading(true);

    try {
      const nextState = !driver.isOnline;
      const response = await toggleDriverAvailability(nextState);

      if (response?.success) {
        setDriver((previous) => ({ ...previous, isOnline: nextState }));
      }
    } catch (error) {
      console.error("Failed to toggle driver availability", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await acceptRideRequest(rideId);
      if (response?.success) {
        setRideRequests((previous) => previous.filter((ride) => ride.id !== rideId));
        await loadDashboard();
      }
    } catch (error) {
      console.error("Failed to accept ride", error);
    }
  };

  const handleStartRide = async (rideId) => {
    try {
      const response = await startRideRequest(rideId);
      if (response?.success) {
        setRideRequests((previous) => previous.filter((ride) => ride.id !== rideId));
        await loadDashboard();
      }
    } catch (error) {
      console.error("Failed to start ride", error);
    }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      const response = await completeRideRequest(rideId);
      if (response?.success) {
        const completedRide = rideRequests.find((ride) => ride.id === rideId) || activeRide;
        const tripSummary = {
          pickup: completedRide?.pickup || "Current location",
          destination: completedRide?.destination || "Destination",
          fare: Number(completedRide?.fare || 0),
          distance: Number(completedRide?.distance || completedRide?.trip_distance || 8.4),
          status: "completed",
        };

        localStorage.setItem("lastTripSummary", JSON.stringify(tripSummary));
        setRideRequests((previous) => previous.filter((ride) => ride.id !== rideId));
        await loadDashboard();
        navigate("/driver/payment-complete");
      }
    } catch (error) {
      console.error("Failed to complete ride", error);
    }
  };

  const renderActiveRideCard = () => {
    if (!activeRide) {
      return null;
    }

    const rideStatus = String(activeRide.status || "accepted").toLowerCase();
    const routeKm = getRideDistance(activeRide);
    const etaValue = getRideETA(activeRide);

    return (
      <div className="active-ride-panel">
        <div className="request-panel-header">
          <h3>Current trip</h3>
          <span>{rideStatus === "started" ? "In progress" : "Accepted"}</span>
        </div>

        <div className="route-summary-card">
          <div className="route-summary-top">
            <div>
              <p className="route-summary-label">Trip to</p>
              <h4>{activeRide.destination || "Destination"}</h4>
            </div>
            <span className="eta-pill">
              <Clock3 size={14} />
              ETA {etaCountdown || etaValue} min
            </span>
          </div>

          <div className="route-mini-map">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Active route map">
              <path d={activeRideRoute.path} className="best-route-path" />
              <circle cx={activeRideRoute.startX} cy={activeRideRoute.startY} r={3} className="route-point start-point" />
              <circle cx={activeRideRoute.endX} cy={activeRideRoute.endY} r={3.5} className="route-point end-point" />
              <circle cx={carX} cy={carY} r={4.5} className="route-car-marker" />
            </svg>
          </div>

          <div className="trip-meta-row">
            <div>
              <span>Pickup</span>
              <strong>{activeRide.pickup || "Current Location"}</strong>
            </div>
            <div>
              <span>Distance</span>
              <strong>{routeKm.toFixed(1)} km</strong>
            </div>
            <div>
              <span>Fare</span>
              <strong>₹{activeRide.fare}</strong>
            </div>
          </div>
        </div>

        <div className="ride-request-card active">
          <div className="ride-request-main">
            <strong>{activeRide.user_name || "Passenger"}</strong>
            <p>{activeRide.pickup}</p>
            <p>→ {activeRide.destination}</p>
            <small>
              {routeKm.toFixed(1)} km • {etaCountdown || etaValue} min ETA • ₹{activeRide.fare}
            </small>
          </div>

          {rideStatus === "accepted" ? (
            <button type="button" onClick={() => handleStartRide(activeRide.id)}>
              <CheckCircle2 size={16} />
              Start ride
            </button>
          ) : (
            <button type="button" onClick={() => handleCompleteRide(activeRide.id)}>
              <CheckCircle2 size={16} />
              Complete ride
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="driver-dashboard">
      <aside className="driver-sidebar">
        <div className="driver-sidebar-logo">
          <div className="driver-sidebar-logo-icon">
            <Car size={22} />
          </div>
          <span>VoltRide</span>
        </div>

        <nav className="driver-sidebar-nav">
          <a href="/driver/dashboard" className="driver-sidebar-link active">
            <Car size={20} />
            <span>Drive</span>
          </a>

          <a href="/driver/earnings" className="driver-sidebar-link">
            <Wallet size={20} />
            <span>Earnings</span>
          </a>

          <a href="/driver/profile" className="driver-sidebar-link">
            <UserCircle size={20} />
            <span>Profile</span>
          </a>
        </nav>
      </aside>

      <main className="driver-main">
        <section className="driver-map-area">
          <div className="driver-map-grid"></div>

          <div className="city-road city-road-one"></div>
          <div className="city-road city-road-two"></div>
          <div className="city-road city-road-three"></div>

          {activeRide && (
            <div className="live-route-panel">
              <div className="live-route-header">
                <div className="route-header-icon">
                  <Navigation size={15} />
                </div>
                <div>
                  <p>Live route</p>
                  <strong>{activeRide.pickup || "Current Location"}</strong>
                  <small>to {activeRide.destination || "Destination"}</small>
                </div>
              </div>

              <div className="live-route-details">
                <span>
                  <MapPin size={12} /> {activeRide.destination || "Destination"}
                </span>
                <span>
                  <Clock3 size={12} /> {etaCountdown || getRideETA(activeRide)} min ETA
                </span>
              </div>

              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Trip route preview">
                <path d={activeRideRoute.path} className="best-route-path" />
                <circle cx={activeRideRoute.startX} cy={activeRideRoute.startY} r={3} className="route-point start-point" />
                <circle cx={activeRideRoute.endX} cy={activeRideRoute.endY} r={3.5} className="route-point end-point" />
                <circle cx={carX} cy={carY} r={4.5} className="route-car-marker" />
              </svg>
            </div>
          )}

          <div className="today-earning">
            <Wallet size={19} />
            <span>Today: ₹{driver.todayEarning}</span>
          </div>

          <div className={`online-status ${driver.isOnline ? "online" : "offline"}`}>
            <span className="online-dot"></span>
            <span>{driver.isOnline ? "ONLINE" : "OFFLINE"}</span>
          </div>

          <div className="current-location">
            <div className="location-pulse"></div>
            <div className="location-dot"></div>
          </div>

          <div className="map-pin">
            <MapPin size={20} />
          </div>
        </section>

        <section className="driver-info-panel">
          <div className="panel-handle"></div>

          <div className="driver-greeting">
            <h1>Hello, {driver.name}</h1>
            <p>
              {driver.vehicle} • {driver.vehicleNumber}
            </p>
          </div>

          <div className="driver-stat-grid">
            <div className="driver-stat-card">
              <div className="driver-stat-icon ride-icon">
                <Car size={23} />
              </div>
              <strong>{driver.totalRides}</strong>
              <span>Total Rides</span>
            </div>

            <div className="driver-stat-card">
              <div className="driver-stat-icon rating-icon">
                <Star size={23} fill="currentColor" />
              </div>
              <strong>{driver.rating}</strong>
              <span>Rating</span>
            </div>

            <div className="driver-stat-card">
              <div className="driver-stat-icon wallet-icon">
                <Wallet size={23} />
              </div>
              <strong>₹{driver.wallet}</strong>
              <span>Wallet</span>
            </div>
          </div>

          {driver.isOnline && rideRequests.length > 0 ? (
            <>
              {renderActiveRideCard()}

              <div className="driver-request-panel">
                <div className="request-panel-header">
                  <h3>Ride requests</h3>
                  <span>
                    {rideRequests.filter((ride) => (ride.status || "").toLowerCase() === "requested").length} new
                  </span>
                </div>

                {rideRequests
                  .filter((ride) => (ride.status || "").toLowerCase() === "requested")
                  .map((ride) => (
                    <div key={ride.id} className="ride-request-card">
                      <div className="ride-request-main">
                        <strong>{ride.user_name || "Passenger"}</strong>
                        <p>{ride.pickup}</p>
                        <p>→ {ride.destination}</p>
                        <small>{getRideDistance(ride).toFixed(1)} km • ₹{ride.fare}</small>
                      </div>

                      <button type="button" onClick={() => handleAcceptRide(ride.id)}>
                        <CheckCircle2 size={16} />
                        Accept
                      </button>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="looking-rides-card">
              <div className="search-icon">
                <Search size={54} />
              </div>

              <h2>
                {driver.isOnline
                  ? rideRequests.length > 0
                    ? `Pending request: ${rideRequests.length}`
                    : "Looking for rides..."
                  : "You are offline"}
              </h2>
              <p>
                {driver.isOnline
                  ? "A ride request will appear here when a passenger books a trip."
                  : "Go online to receive new ride requests from riders."}
              </p>
            </div>
          )}

          <button
            className={`go-offline-button ${driver.isOnline ? "online" : "offline"}`}
            onClick={handleAvailabilityToggle}
            disabled={loading}
          >
            <span className="offline-icon">
              <Square size={14} fill="currentColor" />
            </span>
            <span>{loading ? "Updating..." : driver.isOnline ? "Go Offline" : "Go Online"}</span>
          </button>
        </section>
      </main>

      <nav className="driver-mobile-nav">
        <a href="/driver/dashboard" className="driver-mobile-link active">
          <Car size={25} />
          <span>Drive</span>
        </a>

        <a href="/driver/earnings" className="driver-mobile-link">
          <Wallet size={25} />
          <span>Earnings</span>
        </a>

        <a href="/driver/profile" className="driver-mobile-link">
          <UserCircle size={25} />
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
};

export default Dashboard;