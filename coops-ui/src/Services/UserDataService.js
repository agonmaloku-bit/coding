import http from "../http-common";
import AuthHeader from './AuthHeader';

class UserDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/users", { headers: AuthHeader() });
        }
        return http.get(`/admin/users${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/users/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/users", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/users/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/users/${id}`, { headers: AuthHeader() });
    }

    getProcurementOfficerByDepartmentId(id) {
        return http.get(`/admin/users/procurement_officer/departments/${id}`, { headers: AuthHeader() });
    }
    
    getDashboardData() {
        return http.get(`/admin/getDashboardData`, {headers: AuthHeader()});
    }
}

export default new UserDataService();