import { loginRequest, logoutRequest, refreshSessionRequest, verifyAccessTokenRequest, verifyRefreshTokenRequest } from "../../infrastructure/api/requests/auth.request";
import type { LoginRequest } from "../domain/models/auth/AuthModel";
import type { SessionValidation } from "../domain/models/auth/AuthModel";
import type { AuthPort } from "../domain/ports/AuthPort";

export class AuthService implements AuthPort {

    async login(principal: string, password: string): Promise<void> {
        const loginData: LoginRequest = { principal, password };
        const loginResponse = await loginRequest(loginData);
        return loginResponse;
    }

    async logout(): Promise<void> {
        await logoutRequest();
    }

    async validateAccess(): Promise<SessionValidation> {
        const validationResponse = await verifyAccessTokenRequest();
        return validationResponse;
    }

    async validateSession(): Promise<SessionValidation> {
        const validationResponse = await verifyRefreshTokenRequest();
        return validationResponse;
    }

    async refreshSession(): Promise<void> {
        await refreshSessionRequest();
    }

}