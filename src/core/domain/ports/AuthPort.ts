import type { SessionValidation } from "../models/auth/AuthModel";

export interface AuthPort {
    login(username: string, password: string): Promise<void>;
    logout(): Promise<void>;
    validateAccess(): Promise<SessionValidation>;
    validateSession(): Promise<SessionValidation>;
    refreshSession(): Promise<void>;
}