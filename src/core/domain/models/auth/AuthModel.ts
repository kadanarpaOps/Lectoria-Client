export interface LoginRequest {
    principal: string;
    password: string;
}

export interface SessionValidation {
    active: boolean;
}