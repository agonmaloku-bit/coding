import BillDataService from "../../Services/BillDataService";

export default {
  name: "BillReports",
  metaInfo() {
    return { title: this.$t("billReports.title") };
  },
  data() {
    return {
      reports: [],
      loading: false,
      total: 0,
      page: 1,
      perPage: 20,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.perPage);
    },
  },
  created() {
    this.fetchReports();
  },
  methods: {
    async fetchReports() {
      this.loading = true;
      try {
        const res = await BillDataService.getReports(this.page);
        this.reports = (res.data.data || []).map((r) => ({
          ...r,
          downloading: false,
        }));
        this.total = res.data.total || this.reports.length;
      } catch (e) {
        console.error("Failed to load reports", e);
      } finally {
        this.loading = false;
      }
    },
    loadPage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.page = p;
      this.fetchReports();
    },
    async downloadReport(report) {
      report.downloading = true;
      try {
        const res = await BillDataService.downloadReport(report.id);
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        if (win) {
          win.focus();
        }
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      } catch (e) {
        console.error("Download failed", e);
      } finally {
        report.downloading = false;
      }
    },
  },
};
