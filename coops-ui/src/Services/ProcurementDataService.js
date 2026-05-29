import http from "../http-common";
import AuthHeader from "./AuthHeader";

class ProcurementDataService {
  getAll(params) {
    return http.get("/admin/procurement", { headers: AuthHeader(), params });
  }

  get(id) {
    return http.get(`/admin/procurement/${id}`, { headers: AuthHeader() });
  }

  create(data) {
    return http.post("/admin/procurement", data, { headers: AuthHeader() });
  }

  update(id, data) {
    return http.put(`/admin/procurement/${id}`, data, { headers: AuthHeader() });
  }

  delete(id) {
    return http.delete(`/admin/procurement/${id}`, { headers: AuthHeader() });
  }

  advance(id, data) {
    return http.post(`/admin/procurement/${id}/advance`, data, { headers: AuthHeader() });
  }

  reject(id, reason) {
    return http.post(`/admin/procurement/${id}/reject`, { reason }, { headers: AuthHeader() });
  }

  cancel(id) {
    return http.post(`/admin/procurement/${id}/cancel`, {}, { headers: AuthHeader() });
  }
}

export default new ProcurementDataService();
