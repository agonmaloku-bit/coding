import http from "../http-common";
import AuthHeader from "./AuthHeader";

class SupplierDataService {
  getAll(url) {
    if (url == null) {
      return http.get("/admin/suppliers", { headers: AuthHeader() });
    }
    return http.get(`/admin/suppliers${url}`, { headers: AuthHeader() });
  }

  get(id) {
    return http.get(`/admin/suppliers/${id}`, { headers: AuthHeader() });
  }

  create(data) {
    return http.post("/admin/suppliers", data, { headers: AuthHeader() });
  }

  update(id, data) {
    return http.put(`/admin/suppliers/${id}`, data, { headers: AuthHeader() });
  }

  delete(id) {
    return http.delete(`/admin/suppliers/${id}`, { headers: AuthHeader() });
  }
}

export default new SupplierDataService();
