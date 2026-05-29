import http from "../http-common";
import AuthHeader from './AuthHeader';

class PermissionDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/permissions", { headers: AuthHeader() });
        }
        return http.get(`/admin/permissions${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/permissions/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/permissions", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/permissions/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/permissions/${id}`, { headers: AuthHeader() });
    }
}

export default new PermissionDataService();