import type { LoginRequest, SessionValidation } from "../../../core/domain/models/auth/AuthModel";
import httpClient from "../config/axios.instance";

export const loginRequest = async (loginData: LoginRequest): Promise<void> => {
    const response = await httpClient.post(`auth/login`, loginData);
    return response.data;
}

export const logoutRequest = async (): Promise<void> => {
    await httpClient.post(`auth/logout`);
}

export const verifyAccessTokenRequest = async (): Promise<SessionValidation> => {
    const response = await httpClient.post(`auth/validate/access`);
    return response.data;
}

export const verifyRefreshTokenRequest = async (): Promise<SessionValidation> => {
    const response = await httpClient.post(`auth/validate/session`);
    return response.data;
}

export const refreshSessionRequest = async (): Promise<void> => {
    await httpClient.post(`auth/refresh-session`);
}
