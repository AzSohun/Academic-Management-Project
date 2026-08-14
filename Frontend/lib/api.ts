import axios from "axios";

export const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let accessTokenMemory: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessTokenMemory = token;
};

export const getAccessToken = () => accessTokenMemory;

api.interceptors.request.use((config) => {
    if (accessTokenMemory) {
        config.headers.Authorization = `Bearer ${accessTokenMemory}`;
    }
    return config;
});


let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post<{ accessToken: string }>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
                {},
                { withCredentials: true }
            )
            .then((res) => {
                const newToken = res.data.accessToken;
                setAccessToken(newToken);
                return newToken;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                setAccessToken(null);
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);