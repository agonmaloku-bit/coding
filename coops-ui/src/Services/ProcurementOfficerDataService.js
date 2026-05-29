import http from "../http-common";
import AuthHeader from './AuthHeader';

class ProcurementOfficerDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/users/procurement_officer", { headers: AuthHeader() });
        }
        return http.get(`/admin/users/procurement_officer${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/users/procurement_officer/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/users/procurement_officer", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/users/procurement_officer/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/users/procurement_officer/${id}`, { headers: AuthHeader() });
    }
}

export default new ProcurementOfficerDataService();