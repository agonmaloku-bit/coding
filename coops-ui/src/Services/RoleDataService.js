import http from "../http-common";
import AuthHeader from './AuthHeader';

class RoleDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/roles", { headers: AuthHeader() });
        }
        return http.get(`/admin/roles${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/roles/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/roles", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/roles/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/roles/${id}`, { headers: AuthHeader() });
    }

    getAllRolesByDepartmentIds(ids) {
        return http.get(`/admin/roles/departments/${ids}`, { headers: AuthHeader() });
    }

    getRoleByNameAndByDepartmentIds(ids, role_slug) {
        return http.get(`/admin/roles/departments/${ids}/role/${role_slug}`, { headers: AuthHeader() });
    }
}

export default new RoleDataService();
