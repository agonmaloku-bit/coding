import http from "../http-common";
import AuthHeader from './AuthHeader';

class ContractTypeDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/contract_types", { headers: AuthHeader() });
        }
        return http.get(`/admin/contract_types${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/contract_types/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/contract_types", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.put(`/admin/contract_types/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/contract_types/${id}`, { headers: AuthHeader() });
    }
}

export default new ContractTypeDataService();