import http from "../http-common";
import AuthHeader from "./AuthHeader";

class BillDataService {
  getAll(url) {
    if (url == null) {
      // console.log('API Request URL:', '/admin/bills');
      return http.get("/admin/bills", { headers: AuthHeader() });
    }
    
    // const fullUrl = `/admin/bills${url}`;
    // console.log('API Request URL:', fullUrl);

    return http.get(`/admin/bills${url}`, { headers: AuthHeader() });
  }

  getArchive(url) {
    if (url == null) {
      return http.get("/admin/bills/archive", { headers: AuthHeader() });
    }
    return http.get(`/admin/bills/archive${url}`, { headers: AuthHeader() });
  }

  get(id) {
    return http.get(`/admin/bills/${id}`, { headers: AuthHeader() });
  }

  create(data) {
    return http.post("/admin/bills", data, { headers: AuthHeader() });
  }

  request(data) {
    return http.post("/admin/bills/request", data, { headers: AuthHeader() });
  }

  update(id, data) {
    return http.post(`/admin/bills/${id}`, data, { headers: AuthHeader() });
  }

  delete(id) {
    return http.delete(`/admin/bills/${id}`, { headers: AuthHeader() });
  }
  Filedelete(id) {
    return http.delete(`/admin/bill_files/${id}`, { headers: AuthHeader() });
  }

  // attachment gett

  attachment(id) {
    return http.get(`/admin/billattachments/${id}`, {
      headers: AuthHeader(),
      responseType: "blob",
    });
  }

  count() {
    return http.get("/admin/bills/count", { headers: AuthHeader() });
  }

  approve(id, comment, file) {
    let payload;
    if (file) {
      payload = new FormData();
      payload.append("comment", comment);
      payload.append("file", file);
    } else {
      payload = { comment: comment };
    }
    return http.post(`/admin/bills/${id}/approve`, payload, {
      headers: AuthHeader(),
    });
  }

  cancel(id, comment) {
    return http.post(
      `/admin/bills/${id}/cancel`,
      { comment: comment },
      { headers: AuthHeader() }
    );
  }

  excel(query) {
    return http.get(`/admin/bills/export${query}`, {
      headers: AuthHeader(),
      responseType: "blob",
    });
  }

  dashboard() {
    return http.get("/admin/bills/dashboard", { headers: AuthHeader() });
  }

  generateReport(billIds, locale) {
    return http.post(
      "/admin/bills/report",
      { bill_ids: billIds, locale: locale || 'sq' },
      { headers: AuthHeader(), responseType: "blob" }
    );
  }

  getReports(page) {
    const p = page || 1;
    return http.get(`/admin/bills/report?page=${p}`, { headers: AuthHeader() });
  }

  downloadReport(id) {
    return http.get(`/admin/bills/report/${id}/download`, {
      headers: AuthHeader(),
      responseType: "blob",
    });
  }

  timeline(id) {
    return http.get(`/admin/bills/${id}/timeline`, { headers: AuthHeader() });
  }
}

export default new BillDataService();
