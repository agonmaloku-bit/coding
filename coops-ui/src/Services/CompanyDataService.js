import http from "../http-common";
import AuthHeader from './AuthHeader';

class CompanyDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/companies", { headers: AuthHeader() });
        }
        return http.get(`/admin/companies${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/companies/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/companies", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.post(`/admin/companies/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/companies/${id}`, { headers: AuthHeader() });
    }
}

export default new CompanyDataService();