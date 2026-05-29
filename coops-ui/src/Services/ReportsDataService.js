import http from "../http-common";
import AuthHeader from "./AuthHeader";

class ReportsDataService {
  /**
   * @param {"departments"|"suppliers"|"users"} type
   * @param {{preset?:string, from?:string, to?:string}} params
   */
  fetch(type, params = {}) {
    return http.get(`/admin/reports/${type}`, {
      headers: AuthHeader(),
      params,
    });
  }

  departments(params) { return this.fetch("departments", params); }
  suppliers(params)   { return this.fetch("suppliers", params); }
  users(params)       { return this.fetch("users", params); }
}

export default new ReportsDataService();
