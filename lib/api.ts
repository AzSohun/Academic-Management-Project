import axios from "axios";


export const api = axios.create({
    baseURL: `https://localhost:7015/api`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});


let accessTokenMemory: string | null = null;


export const setAccessToken = (token: string | null) => {
    accessTokenMemory = token;
};


api.interceptors.request.use((config) => {
    if (accessTokenMemory) {
        config.headers.Authorization = `Bearer ${accessTokenMemory}`;
    }
    return config;
});


api.interceptors.response.use((response) => response,
    async (error) => {
        const orginalRequest = error.config;

        if (error.response?.status === 401 && !orginalRequest._retry) {
            orginalRequest._retry = true;

            try {

                const res = await axios.post<{ accessToken: string }>(
                    'https://localhost:7015/api/auth/refresh-token',
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = res.data.accessToken;
                setAccessToken(newAccessToken);

                orginalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(orginalRequest);

            } catch (refreshError) {
                setAccessToken(null);
                if (typeof window !== "undefined") {
                    window.location.href = "/login"
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

