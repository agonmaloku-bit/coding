import http from "../http-common";
import AuthHeader from "./AuthHeader";

class AiSettingsDataService {
    get() {
        return http.get("/admin/ai/settings", { headers: AuthHeader() });
    }
    save(payload) {
        return http.post("/admin/ai/settings", payload, { headers: AuthHeader() });
    }
    test() {
        return http.post("/admin/ai/settings/test", {}, { headers: AuthHeader() });
    }
    verifyBill(id) {
        return http.post(`/admin/bills/${id}/verify-ai`, {}, { headers: AuthHeader() });
    }
    latestCheck(id) {
        return http.get(`/admin/bills/${id}/ai-checks/latest`, { headers: AuthHeader() });
    }
    extractBill(file) {
        const fd = new FormData();
        fd.append("file", file);
        return http.post("/admin/ai/extract-bill", fd, {
            headers: { ...AuthHeader(), "Content-Type": "multipart/form-data" },
        });
    }
}

export default new AiSettingsDataService();
