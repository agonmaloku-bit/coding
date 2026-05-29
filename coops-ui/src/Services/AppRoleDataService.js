import http from "../http-common";
import AuthHeader from './AuthHeader';

class AppRoleDataService {
    getApps() {
        return http.get("/admin/business_apps", { headers: AuthHeader() });
    }

    getAssignmentsByApp(appId) {
        return http.get(`/admin/business_apps/${appId}/assignments`, { headers: AuthHeader() });
    }

    getAssignmentsByUser(userId) {
        return http.get(`/admin/business_apps/user/${userId}/assignments`, { headers: AuthHeader() });
    }

    addAssignment(data) {
        return http.post("/admin/business_apps/assignments", data, { headers: AuthHeader() });
    }

    removeAssignment(id) {
        return http.delete(`/admin/business_apps/assignments/${id}`, { headers: AuthHeader() });
    }
}

export default new AppRoleDataService();
