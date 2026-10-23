import { createContext } from "react";
import type { RegisterUserRequest } from "../../core/domain/models/users/UserModel";

export interface UserContextType {
    // Basics
    loading: boolean;
    error: string | null;
    // Rest Methods
    registerUser: (user: RegisterUserRequest) => Promise<boolean>;
}

export const UserContext = createContext<UserContextType | null>(null);