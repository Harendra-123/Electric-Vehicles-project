import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const getUserProfile = async () => {
  try {
    const response = await api.get("/api/users/profile", getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (payload) => {
  try {
    const response = await api.put("/api/users/profile", payload, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserRideHistory = async () => {
  try {
    const response = await api.get("/api/rides/history", getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRideDetails = async (rideId) => {
  try {
    const response = await api.get(`/api/rides/${rideId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserPayments = async () => {
  try {
    const response = await api.get("/api/payments/my-payments", getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const bookRide = async (rideData) => {
  try {
    const response = await api.post("/api/rides", rideData, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDriverDashboardData = async () => {
  try {
    const response = await api.get("/api/rides/driver/summary", getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDriverProfile = async () => {
  try {
    const response = await api.get("/api/drivers/profile", getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDriverProfile = async (payload) => {
  try {
    const response = await api.put("/api/drivers/profile", payload, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/api/payments/ride/${paymentId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDriverRideRequests = async () => {
  try {
    const response = await api.get("/api/rides/driver/requests", getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDriverAvailability = async () => {
  try {
    const response = await api.get("/api/rides/driver/availability", getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleDriverAvailability = async (isOnline) => {
  try {
    const response = await api.put(
      "/api/rides/driver/availability",
      { is_online: isOnline },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const acceptRideRequest = async (rideId) => {
  try {
    const response = await api.put(`/api/rides/${rideId}/accept`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const startRideRequest = async (rideId) => {
  try {
    const response = await api.put(`/api/rides/${rideId}/start`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const completeRideRequest = async (rideId) => {
  try {
    const response = await api.put(`/api/rides/${rideId}/complete`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};
