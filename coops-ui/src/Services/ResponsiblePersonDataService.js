import http from "../http-common";
import AuthHeader from './AuthHeader';

class ResponsiblePersonDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/users/responsible_person", { headers: AuthHeader() });
        }
        return http.get(`/admin/users/responsible_person${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/users/responsible_person/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/users/responsible_person", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/users/responsible_person/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/users/responsible_person/${id}`, { headers: AuthHeader() });
    }

    getByDepartmentId(id) {
        return http.get(`/admin/users/responsible_person/departments/${id}`, { headers: AuthHeader() });
    }
}

export default new ResponsiblePersonDataService();