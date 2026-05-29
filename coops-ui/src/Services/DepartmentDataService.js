import http from "../http-common";
import AuthHeader from './AuthHeader';

class DepartmentDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/departments", { headers: AuthHeader() });
        }
        return http.get(`/admin/departments${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/departments/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/departments", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/departments/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/departments/${id}`, { headers: AuthHeader() });
    }

    count() {
        return http.get("/admin/departments/count", { headers: AuthHeader() });
    }

    getDepartmentByCompanyId(id) {
        return http.get(`/admin/departments/company/${id}`, { headers: AuthHeader() });
    }
}

export default new DepartmentDataService();