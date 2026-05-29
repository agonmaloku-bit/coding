import { useMeta } from "vue-meta";
import dirtyGuard from "../../Mixins/dirtyGuard";
import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import AppRoleDataService from "../../Services/AppRoleDataService";
import DepartmentDataService from "../../Services/DepartmentDataService";
import RoleDataService from "../../Services/RoleDataService";
import UserDataService from "../../Services/UserDataService";

export default {
  name: "AppRoles",
    mixins: [dirtyGuard],
  components: {
    "content-header": ContentHeader,
    "breadcrumb-item": BreadcrumbItem,
  },
  setup() {
    useMeta({ title: "App Role Assignments" });
  },
  data() {
    return {
      apps: [],
      selectedApp: null,
      assignments: [],
      loadingApps: false,
      loadingAssignments: false,
      saving: false,
      showForm: false,

      users: [],
      roles: [],
      departments: [],

      form: this.emptyForm(),
    };
  },
  methods: {
    emptyForm() {
      return {
        user_id: "",
        role_ids: [],
        department_id: "",
      };
    },

    resetForm() {
      this.form = this.emptyForm();
    },

    loadApps() {
      this.loadingApps = true;
      AppRoleDataService.getApps()
        .then((res) => {
          this.apps = res.data.data || res.data;
        })
        .finally(() => { this.loadingApps = false; });
    },

    loadUsers() {
      UserDataService.getAll(null).then((res) => {
        this.users = res.data.data || res.data;
      });
    },

    loadRoles() {
      RoleDataService.getAll(null).then((res) => {
        this.roles = res.data.data || res.data;
      });
    },

    loadDepartments() {
      DepartmentDataService.getAll(null).then((res) => {
        this.departments = res.data.data || res.data;
      });
    },

    selectApp(app) {
      this.selectedApp = app;
      this.showForm = false;
      this.resetForm();
      this.loadAssignments();
    },

    loadAssignments() {
      if (!this.selectedApp) return;
      this.loadingAssignments = true;
      this.assignments = [];
      AppRoleDataService.getAssignmentsByApp(this.selectedApp.id)
        .then((res) => {
          this.assignments = res.data.data || res.data;
        })
        .finally(() => { this.loadingAssignments = false; });
    },

    onAddAssignment() {
      if (!this.form.user_id || !this.form.role_ids.length) return;
      this.saving = true;
      AppRoleDataService.addAssignment({
        business_app_id: this.selectedApp.id,
        user_id: this.form.user_id,
        role_ids: this.form.role_ids,
        department_id: this.form.department_id || null,
      })
        .then(() => {
          this.showForm = false;
          this.resetForm();
          this.loadAssignments();
        })
        .finally(() => { this.saving = false; });
    },

    onRemoveAssignment(assignment) {
      if (!confirm(this.$t("common.confirmDelete"))) return;
      AppRoleDataService.removeAssignment(assignment.id).then(() => {
        this.assignments = this.assignments.filter((a) => a.id !== assignment.id);
      });
    },

    formatDate(dt) {
      if (!dt) return "—";
      return new Date(dt).toLocaleDateString();
    },
  },
  mounted() {
    this.loadApps();
    this.loadUsers();
    this.loadRoles();
    this.loadDepartments();
  },
};
