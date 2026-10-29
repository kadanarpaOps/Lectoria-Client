import axios from "axios";
import type { UserModel } from "../../../core/domain/models/users/UserModel";
import type { SessionValidation } from "../../../core/domain/models/auth/AuthModel";

const apiURL = import.meta.env.VITE_API_URL;

const httpClient = axios.create({
    baseURL: apiURL,
    withCredentials: true,
})

const storyBaseURL = import.meta.env.VITE_STORY_API_URL ||
    `${(apiURL ?? "").replace(/\/api\/?$/, "")}/`;
export const storyClient = axios.create({
    baseURL: storyBaseURL,
    withCredentials: true,
});

let requestInterceptorId: number | null = null;

export const setupAxiosResponseInterceptor = (
    authUser: UserModel | null,
    validateAccess: () => Promise<SessionValidation>,
    verifySession: () => Promise<SessionValidation>,
    refreshSession: () => Promise<void>,
    logout: () => void
) => {

    if (requestInterceptorId !== null) {
        httpClient.interceptors.request.eject(requestInterceptorId);
    }

    requestInterceptorId = httpClient.interceptors.request.use(
        async (config) => {
            if (!authUser) return config;

            // We define routes to don't validate
            if (config.url?.includes('auth/')) {
                return config;
            }

            try {
                const access = await validateAccess();
                
                if (!access.active) {
                    console.log("Access expired, checking session...");
                    const session = await verifySession();
                    
                    if (session.active) {
                        console.log("Session active, refreshing token...");
                        await refreshSession();
                    } else {
                        console.log("Session expired, logging out...");
                        logout();
                        return Promise.reject("Session expired");
                    }
                }
            } catch (error) {
                console.error("Error in request interceptor:", error);
                // If validation fails, we can choose to logout or just reject the request
                return Promise.reject(error);
            }

            return config;
        },
        (error) => Promise.reject(error)
    );
};

export default httpClient;
