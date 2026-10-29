import axios, { type InternalAxiosRequestConfig } from "axios";
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

let httpRequestInterceptorId: number | null = null;
let storyRequestInterceptorId: number | null = null;
let refreshInProgress: Promise<void> | null = null;

export const setupAxiosResponseInterceptor = (
    authUser: UserModel | null,
    validateAccess: () => Promise<SessionValidation>,
    verifySession: () => Promise<SessionValidation>,
    refreshSession: () => Promise<void>,
    logout: () => void
) => {

    if (httpRequestInterceptorId !== null) {
        httpClient.interceptors.request.eject(httpRequestInterceptorId);
    }
    if (storyRequestInterceptorId !== null) {
        storyClient.interceptors.request.eject(storyRequestInterceptorId);
    }

    const validateAndRefresh = async (config: InternalAxiosRequestConfig) => {
        if (!authUser || config.url?.includes("auth/")) return config;

        try {
            const access = await validateAccess();
            if (access.active) return config;

            const session = await verifySession();
            if (!session.active) {
                logout();
                throw new Error("Session expired");
            }

            if (!refreshInProgress) {
                refreshInProgress = refreshSession().finally(() => {
                    refreshInProgress = null;
                });
            }
            await refreshInProgress;
            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    httpRequestInterceptorId = httpClient.interceptors.request.use(validateAndRefresh);
    storyRequestInterceptorId = storyClient.interceptors.request.use(validateAndRefresh);
};

export default httpClient;
