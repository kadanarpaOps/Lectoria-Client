import { createContext } from "react";
import type { UserModel } from "../../core/domain/models/users/UserModel";
import type { SessionValidation } from "../../core/domain/models/auth/AuthModel";

export interface AuthContextType {
    // Basics
    loading: boolean;
    error: string | null;
    // Auth User Info
    authUser: UserModel | null;
    // Refresh Auth User Info
    modifiedAuthUser: boolean;
    // Fetch Info per Modification
    setModifiedAuthUser: (modified: boolean) => void;
    // Rest Methods
    login: (principal: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    validateAccess: () => Promise<SessionValidation>;
    validateSession: () => Promise<SessionValidation>;
    refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);