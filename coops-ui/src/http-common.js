import axios from "axios";
import Store from "./Store";
import Router from './Router/index';

// Resolve API base URL at runtime.
// Priority: user-chosen value (localStorage) -> build-time env -> current origin's /api/.
function normalizeBaseUrl(value) {
    if (!value) return value;
    let v = String(value).trim();
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    if (!v.endsWith('/')) v += '/';
    return v;
}
const storedBase = (typeof localStorage !== 'undefined') ? localStorage.getItem('apiBaseUrl') : null;
const envBase = process.env.VUE_APP_URL;
const defaultBase = (typeof window !== 'undefined') ? `${window.location.origin}/api/` : '/api/';
export const API_BASE_URL = normalizeBaseUrl(storedBase || envBase || defaultBase);

const http = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Accept": "application/json",
        "Content-type": "application/json",
    },
});

// Track the number of in-flight mutating requests (POST/PUT/PATCH/DELETE) and
// expose a single global busy overlay via the `ui` store. Any request can
// opt out by passing `skipBusy: true` in its axios config.
let busyCount = 0;
const bumpBusy = (delta, message) => {
    busyCount = Math.max(0, busyCount + delta);
    if (busyCount > 0) {
        Store.dispatch("ui/setBusy", { busy: true, message: message || "" });
    } else {
        Store.dispatch("ui/setBusy", false);
    }
};

http.interceptors.request.use((config) => {
    const method = (config.method || "get").toLowerCase();
    const mutating = ["post", "put", "patch", "delete"].includes(method);
    if (mutating && !config.skipBusy) {
        config._busyTracked = true;
        bumpBusy(+1, config.busyMessage);
    }
    return config;
});

http.interceptors.response.use(function(response) {
    if (response.config && response.config._busyTracked) {
        bumpBusy(-1);
    }
    return response;
}, function(error) {
    if (error && error.config && error.config._busyTracked) {
        bumpBusy(-1);
    }
    if (error) {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            Store.dispatch("auth/logout");
            return Router.push("/login");
        }
    }

    return Promise.reject(error);
});

export default http;