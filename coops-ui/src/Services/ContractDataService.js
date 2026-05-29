import http from "../http-common";
import AuthHeader from './AuthHeader';

class ContractDataService {
    getAll(url) {
        if (url == null) {
            return http.get("/admin/contracts", { headers: AuthHeader() });
        }
        return http.get(`/admin/contracts${url}`, { headers: AuthHeader() });
    }
    
    getArchive(url) {
        if (url == null) {
            return http.get("/admin/contracts/archive", { headers: AuthHeader() });
        }
        return http.get(`/admin/contracts/archive${url}`, { headers: AuthHeader() });
    }

    get(id) {
        return http.get(`/admin/contracts/${id}`, { headers: AuthHeader() });
    }

    create(data) {
        return http.post("/admin/contracts", data, { headers: AuthHeader() });
    }

    request(data) {
        return http.post("/admin/contracts/request", data, { headers: AuthHeader() });
    }

    update(id, data) {
        return http.post(`/admin/contracts/${id}`, data, { headers: AuthHeader() });
    }

    delete(id) {
        return http.delete(`/admin/contracts/${id}`, { headers: AuthHeader() });
    }

    attachment(id) {
        return http.get(`/admin/attachments/${id}`, { headers: AuthHeader(), responseType: "blob" });
    }

    count() {
        return http.get("/admin/contracts/count", { headers: AuthHeader() });
    }

    approve(id, comment, file) {
        let payload
        if(file){
            payload = new FormData()
            payload.append("comment", comment);
            payload.append("file", file);
        }else{
            payload = {comment: comment}
        }
        return http.post(`/admin/contracts/${id}/approve`, payload, { headers: AuthHeader() });
    }

    cancel(id, comment) {
        return http.post(`/admin/contracts/${id}/cancel`, { comment: comment }, { headers: AuthHeader() });
    }

    requestChanges(id, comment, files) {
        const fd = new FormData();
        fd.append("comment", comment || "");
        if (files && files.length) {
            Array.from(files).forEach(f => fd.append("files[]", f));
        }
        return http.post(`/admin/contracts/${id}/request-changes`, fd, { headers: AuthHeader() });
    }

    reassign(id, userId, comment) {
        return http.post(
            `/admin/contracts/${id}/reassign`,
            { user_id: userId, comment: comment || "" },
            { headers: AuthHeader() }
        );
    }

    timeline(id) {
        return http.get(`/admin/contracts/${id}/timeline`, { headers: AuthHeader() });
    }

    excel(query) {
        return http.get(`/admin/contracts/export${query}`, { headers: AuthHeader(), responseType: "blob" });
    }

    getBySupplier(supplierId) {
        return http.get(`/admin/contracts/supplier/${supplierId}`, { headers: AuthHeader() });
    }
}

export default new ContractDataService();