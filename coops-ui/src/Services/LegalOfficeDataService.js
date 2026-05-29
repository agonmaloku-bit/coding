import http from "../http-common";
import AuthHeader from './AuthHeader';

class LegalOfficeDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/users/legal_office", { headers: AuthHeader() });
        }
        return http.get(`/admin/users/legal_office${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/users/legal_office/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/users/legal_office", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/users/legal_office/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/users/legal_office/${id}`, { headers: AuthHeader() });
    }
}

export default new LegalOfficeDataService();