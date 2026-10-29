import { useEffect, useRef, useState, type ReactNode } from "react"
import { AuthService } from "../../../core/use-cases/AuthUseCases";
import type { UserModel } from "../../../core/domain/models/users/UserModel";
import executeTask from "../utils/TaskExecutor";
import type { SessionValidation } from "../../../core/domain/models/auth/AuthModel";
import { AuthContext, type AuthContextType } from "../AuthContext";
import { useAlert } from "../../hooks/useAlert";
import { AuthUserService } from "../../../core/use-cases/AuthUserUseCases";
import { setupAxiosResponseInterceptor } from "../../../infrastructure/api/config/axios.instance";

type Props = {
    children: ReactNode;
}

const authService = new AuthService();
const authUserService = new AuthUserService();

function AuthProvider({ children }: Props) {
    // Alert Component
    const { showAlert } = useAlert();
    // Basics
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Auth User Info
    const [authUser, setAuthUser] = useState<UserModel | null>(null);
    // Refresh Info per Modification
    const [modifiedAuthUser, setModifiedAuthUser] = useState<boolean>(false);

    // Rest Methods
    const login = async (userName: string, password: string): Promise<boolean> => {
        setError(null);
        await executeTask(() => authService.login(userName, password), setLoading, setError, showAlert, true);
        const userInfo = await executeTask(() => authUserService.getUserProfile(), setLoading, setError, showAlert, true);
        if (!userInfo) return false;
        setAuthUser(userInfo);
        return true;
    };

    const logout = async () => {
        await executeTask(() => authService.logout(), setLoading, setError, showAlert, true);
        localStorage.removeItem('editingChapter');
        localStorage.removeItem('readingChapter');
        setAuthUser(null);
    };
     
    // Validate Auth Methods for Interceptor
    const validateAccess = async (): Promise<SessionValidation> => {
        const validationResponse = await executeTask(() => authService.validateAccess(), () => {}, setError) as SessionValidation;
        return validationResponse;
    };

    const validateSession = async (): Promise<SessionValidation> => {
        const validationResponse = await executeTask(() => authService.validateSession(), () => {}, setError) as SessionValidation;
        return validationResponse;
    };

    const refreshSession = async (): Promise<void> => {
        await executeTask(() => authService.refreshSession(), () => {}, setError);
    };
    /** useEffects */
    // Refresh Auth User Info
    useEffect(() => {
        // Private Methods
        const checkAuth = async () => {
            const response = await executeTask(() => authService.validateSession(), setLoading, setError);
            if (!response?.active) {
                setAuthUser(null);
                return;
            }
            const userInfo = await executeTask(() => authUserService.getUserProfile(), setLoading, setError);
            setAuthUser(userInfo);
        }
        checkAuth();
    }, []);


    // Refresh per Auth User Modification
    const authUserRef = useRef(authUser);
    // Mantain the ref sync with the actual state
    useEffect(() => {
        authUserRef.current = authUser;
    }, [authUser]);

    useEffect(() => {
        setupAxiosResponseInterceptor(
            authUser,
            validateAccess,
            validateSession,
            refreshSession,
            () => { void logout(); }
        );
    });

    useEffect(() => {
        // Private Methods
        const refreshInfo = async () => {
            if (!modifiedAuthUser || !authUserRef.current) return;

            const userInfo = await executeTask(() => authUserService.getUserProfile(), setLoading, setError);

            setAuthUser(userInfo);
            setModifiedAuthUser(false);
        };
        refreshInfo();
    }, [modifiedAuthUser]);

    /** Export values */
    const exportValues: AuthContextType = {
        loading,
        error,
        authUser,
        modifiedAuthUser,
        setModifiedAuthUser,
        login,
        logout,
        validateAccess,
        validateSession,
        refreshSession,
    };

    return (
        <AuthContext.Provider value={exportValues}>{children}</AuthContext.Provider>
    )

}

export default AuthProvider;
