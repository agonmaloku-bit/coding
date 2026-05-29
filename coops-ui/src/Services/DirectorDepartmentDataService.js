import http from "../http-common";
import AuthHeader from './AuthHeader';

class DirectorDepartmentDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/users/director_department", { headers: AuthHeader() });
        }
        return http.get(`/admin/users/director_department${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/users/director_department/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/users/director_department", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/users/director_department/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/users/director_department/${id}`, { headers: AuthHeader() });
    }
}

export default new DirectorDepartmentDataService();