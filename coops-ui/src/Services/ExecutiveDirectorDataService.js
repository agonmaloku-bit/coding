import http from "../http-common";
import AuthHeader from './AuthHeader';

class ExecutiveDirectorDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/users/executive_director", { headers: AuthHeader() });
        }
        return http.get(`/admin/users/executive_director${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/users/executive_director/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/users/executive_director", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/users/executive_director/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/users/executive_director/${id}`, { headers: AuthHeader() });
    }
}

export default new ExecutiveDirectorDataService();