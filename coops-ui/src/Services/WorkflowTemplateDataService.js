import http from "../http-common";
import AuthHeader from './AuthHeader';

class WorkflowTemplateDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/workflow_templates", { headers: AuthHeader() });
        }
        return http.get(`/admin/workflow_templates${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/workflow_templates/${id}`, { headers: AuthHeader() });
    }

    getByType(type) {
        return http.get(`/admin/workflow_templates/type/${type}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/workflow_templates", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/workflow_templates/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/workflow_templates/${id}`, { headers: AuthHeader() });
    }
}

export default new WorkflowTemplateDataService();
