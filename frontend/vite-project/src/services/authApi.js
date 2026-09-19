import api from "./api";

export const signupUser = (userData) => {
    return api.post("/api/auth/signup", userData);
};

export const loginUser = (loginData) => {
    return api.post("/api/auth/login", loginData);
};

export const forgotPassword = (data) => {
    return api.post("/api/auth/forgot-password", data);
};