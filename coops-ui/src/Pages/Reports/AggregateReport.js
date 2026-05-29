import ReportsDataService from "../../Services/ReportsDataService";

export default {
  name: "AggregateReport",
  props: {
    type: {
      type: String,
      required: true,
      validator: (v) => ["departments", "suppliers", "users"].includes(v),
    },
  },
  metaInfo() {
    return { title: this.$t("reports." + this.type + ".title") };
  },
  data() {
    return {
      preset: "this_month",
      customFrom: "",
      customTo: "",
      loading: false,
      rows: [],
      totals: { bill_count: 0, total_value: 0 },
      range: { from: "", to: "" },
      presets: [
        { value: "today",      label: "today" },
        { value: "yesterday",  label: "yesterday" },
        { value: "this_week",  label: "thisWeek" },
        { value: "last_week",  label: "lastWeek" },
        { value: "this_month", label: "thisMonth" },
        { value: "last_month", label: "lastMonth" },
        { value: "custom",     label: "custom" },
      ],
    };
  },
  watch: {
    type() {
      this.fetch();
    },
  },
  created() {
    this.fetch();
  },
  methods: {
    setPreset(value) {
      this.preset = value;
      if (value !== "custom") {
        this.fetch();
      }
    },
    applyCustom() {
      if (!this.customFrom || !this.customTo) return;
      this.fetch();
    },
    async fetch() {
      this.loading = true;
      try {
        const params = { preset: this.preset };
        if (this.preset === "custom") {
          if (!this.customFrom || !this.customTo) {
            this.loading = false;
            return;
          }
          params.from = this.customFrom;
          params.to   = this.customTo;
        }
        const res = await ReportsDataService.fetch(this.type, params);
        const payload = res.data || {};
        this.rows   = payload.data   || [];
        this.totals = payload.totals || { bill_count: 0, total_value: 0 };
        this.range  = payload.range  || { from: "", to: "" };
      } catch (e) {
        console.error("Failed to load report", e);
        this.rows = [];
        this.totals = { bill_count: 0, total_value: 0 };
      } finally {
        this.loading = false;
      }
    },
    formatMoney(value) {
      const n = Number(value || 0);
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
  },
};
