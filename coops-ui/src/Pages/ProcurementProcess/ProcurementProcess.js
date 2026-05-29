import { useMeta } from "vue-meta";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import ProcurementDataService from "../../Services/ProcurementDataService";
import DepartmentDataService from "../../Services/DepartmentDataService";
import UserDataService from "../../Services/UserDataService";

const STATUSES = [
  { status: 1, label: "Draft",            color: "#64748b" },
  { status: 2, label: "Submitted",        color: "#0ea5e9" },
  { status: 3, label: "Under Review",     color: "#f59e0b" },
  { status: 4, label: "Approved",         color: "#10b981" },
  { status: 5, label: "In Processing",    color: "#8b5cf6" },
  { status: 6, label: "Offer Evaluation", color: "#f97316" },
  { status: 7, label: "Awarded",          color: "#3b82f6" },
  { status: 8, label: "Completed",        color: "#22c55e" },
  { status: 9, label: "Rejected",         color: "#ef4444" },
  { status: 10, label: "Cancelled",       color: "#9ca3af" },
];

export default {
  name: "ProcurementProcess",
  components: { VPagination },
  setup() {
    useMeta({ title: "Procurement Process" });
  },
  data() {
    return {
      items: [],
      loading: false,
      saving: false,
      acting: false,
      pagination: null,
      page: 1,
      searchText: "",
      filterStatus: null,
      filterType: "",
      searchTimer: null,

      showForm: false,
      showDetail: false,
      editMode: false,
      selected: null,

      form: this.emptyForm(),
      actionData: { assigned_officer: "", notes: "", reason: "" },

      departments: [],
      officers: [],
      pipeline: STATUSES.filter((s) => ![9, 10].includes(s.status)),
    };
  },
  computed: {
    filteredItems() {
      let list = this.items;
      if (this.filterStatus != null) {
        list = list.filter((i) => i.status === this.filterStatus);
      }
      return list;
    },
  },
  methods: {
    emptyForm() {
      return {
        title: "",
        description: "",
        justification: "",
        procurement_type: "goods",
        estimated_value: "",
        department_id: "",
        needed_by: "",
        notes: "",
      };
    },

    loadAll() {
      this.loading = true;
      const params = {
        page: this.page,
        search_text: this.searchText || undefined,
        procurement_type: this.filterType || undefined,
      };
      ProcurementDataService.getAll(params)
        .then((res) => {
          if (res.data.data && res.data.meta) {
            this.items = res.data.data;
            this.pagination = res.data.meta;
          } else {
            this.items = res.data.data || res.data;
            this.pagination = null;
          }
        })
        .finally(() => { this.loading = false; });
    },

    loadDepartments() {
      DepartmentDataService.getAll(null).then((res) => {
        this.departments = res.data.data || res.data;
      });
    },

    loadOfficers() {
      UserDataService.getAll(null).then((res) => {
        this.officers = res.data.data || res.data;
      });
    },

    debouncedSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => this.loadAll(), 400);
    },

    filterByStatus(status) {
      this.filterStatus = this.filterStatus === status ? null : status;
    },

    statusCount(status) {
      return this.items.filter((i) => i.status === status).length;
    },

    onPageChange(p) {
      this.page = p;
      this.loadAll();
    },

    openCreate() {
      this.editMode = false;
      this.form = this.emptyForm();
      this.showForm = true;
    },

    openEdit(item) {
      this.editMode = true;
      this.selected = item;
      this.form = {
        title: item.title,
        description: item.description || "",
        justification: item.justification || "",
        procurement_type: item.procurement_type,
        estimated_value: item.estimated_value || "",
        department_id: item.department?.id || "",
        needed_by: item.needed_by || "",
        notes: item.notes || "",
      };
      this.showForm = true;
    },

    openDetail(item) {
      this.selected = item;
      this.actionData = { assigned_officer: "", notes: "", reason: "" };
      this.showDetail = true;
    },

    closeModal() {
      this.showForm = false;
      this.showDetail = false;
    },

    onSave() {
      if (!this.form.title || !this.form.department_id) return;
      this.saving = true;
      const call = this.editMode
        ? ProcurementDataService.update(this.selected.id, this.form)
        : ProcurementDataService.create(this.form);
      call
        .then(() => {
          this.closeModal();
          this.loadAll();
        })
        .finally(() => { this.saving = false; });
    },

    onDelete(item) {
      if (!confirm(this.$t("common.confirmDelete"))) return;
      ProcurementDataService.delete(item.id).then(() => this.loadAll());
    },

    canAdvance(item) {
      return item && ![8, 9, 10].includes(item.status);
    },

    canReject(item) {
      return item && ![8, 9, 10].includes(item.status);
    },

    canCancel(item) {
      return item && ![8, 9, 10].includes(item.status);
    },

    canAssignOfficer(item) {
      return item && item.status === 4; // transitioning to "In Processing"
    },

    nextStatusLabel(current) {
      const next = STATUSES.find((s) => s.status === current + 1);
      return next ? next.label : "";
    },

    onAdvance() {
      this.acting = true;
      ProcurementDataService.advance(this.selected.id, this.actionData)
        .then((res) => {
          this.selected = res.data;
          this.loadAll();
        })
        .finally(() => { this.acting = false; });
    },

    onReject() {
      if (!this.actionData.reason) return;
      this.acting = true;
      ProcurementDataService.reject(this.selected.id, this.actionData.reason)
        .then((res) => {
          this.selected = res.data;
          this.loadAll();
        })
        .finally(() => { this.acting = false; });
    },

    onCancel() {
      if (!confirm(this.$t("common.confirmDelete"))) return;
      ProcurementDataService.cancel(this.selected.id)
        .then((res) => {
          this.selected = res.data;
          this.loadAll();
          this.closeModal();
        });
    },

    statusStyle(status) {
      const s = STATUSES.find((x) => x.status === status);
      return s
        ? { background: s.color + "22", color: s.color, borderColor: s.color }
        : {};
    },

    trackStepClass(stageStatus, currentStatus) {
      if (currentStatus >= stageStatus) return "done";
      return "";
    },

    typeBadgeClass(type) {
      return {
        goods: "badge-info",
        services: "badge-primary",
        works: "badge-secondary",
      }[type] || "badge-secondary";
    },

    formatValue(val) {
      if (!val) return "—";
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(val);
    },

    formatDate(dt) {
      if (!dt) return "—";
      return new Date(dt).toLocaleDateString();
    },
  },
  mounted() {
    this.loadAll();
    this.loadDepartments();
    this.loadOfficers();
  },
};
