import http from "../http-common";
import AuthHeader from './AuthHeader';

class ContractTemplateDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/contract_templates", { headers: AuthHeader() });
        }
        return http.get(`/admin/contract_templates${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/contract_templates/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/contract_templates", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.post(`/admin/contract_templates/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/contract_templates/${id}`, { headers: AuthHeader() });
    }

    getByContractType(contractTypeId) {
        return http.get(`/admin/contract_templates/contract_type/${contractTypeId}`, { headers: AuthHeader() });
    }

    fillTemplate(id, variables, companyId) {
        return http.post(`/admin/contract_templates/${id}/fill`, { variables: variables, company_id: companyId }, { headers: AuthHeader() });
    }

    download(id) {
        return http.get(`/admin/contract_templates/${id}/download`, {
            headers: AuthHeader(),
            responseType: 'blob'
        });
    }

    extractContent(data) {
        return http.post("/admin/contract_templates/extract-content", data, { headers: AuthHeader() });
    }

    generateFilledDocx(id, variables, companyId) {
        return http.post(`/admin/contract_templates/${id}/fill`, { variables: variables, download: true, company_id: companyId }, {
            headers: AuthHeader(),
        });
    }

    getDownloadUrl(token) {
        const base = process.env.VUE_APP_URL.replace(/\/+$/, '');
        return `${base}/admin/contract_templates/download-temp/${token}`;
    }
}

export default new ContractTemplateDataService();
