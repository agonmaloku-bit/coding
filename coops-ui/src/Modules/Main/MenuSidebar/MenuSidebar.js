import MenuItem from "../../../Components/MenuItem/MenuItem.vue";

export default {
  name: "MenuSidebar",
  components: {
    "app-menu-item": MenuItem,
  },
  computed: {
    user() {
      return this.$store.getters["auth/user"];
    },
    rolePermissions() {
      return this.$store.getters["auth/rolePermissions"];
    },
    directPermissions() {
      return this.$store.getters["auth/directPermissions"];
    },
    isSuperAdmin() {
      return this.user && this.user.roles &&
        this.user.roles.some(r => r.name === 'Super Admin');
    },
    menu() {
      const can = (permission) => {
        if (permission === 'Super Admin') return this.isSuperAdmin;
        if (permission === 'always') return true;
        const inRole = this.rolePermissions && this.rolePermissions.some(p => p.name === permission);
        const inDirect = this.directPermissions && this.directPermissions.some(p => p.name === permission);
        return inRole || inDirect;
      };

      const items = [];

      // Dashboard
      items.push({
        name: this.$t("sidebar.dashboard"),
        path: "/platform",
        icon: "fas fa-tachometer-alt",
      });

      // --- Contracts group ---
      const contractChildren = [];
      if (can("Contract Show All")) {
        contractChildren.push({ name: this.$t("sidebar.contractDashboard"), path: "/platform/contract-dashboard" });
        contractChildren.push({ name: this.$t("sidebar.requestContracts"), path: "/platform/apps/contracts" });
      }
      if (can("Contracts Archive")) {
        contractChildren.push({ name: this.$t("sidebar.archiveContracts"), path: "/platform/contracts/archive" });
      }
      if (can("Contract Type Show All")) {
        contractChildren.push({ name: this.$t("sidebar.contractType"), path: "/platform/contract_types" });
        contractChildren.push({ name: this.$t("sidebar.contractTemplates"), path: "/platform/contract_templates" });
      }
      if (contractChildren.length) {
        items.push({
          name: this.$t("sidebar.contracts"),
          icon: "fas fa-file-contract",
          children: contractChildren,
        });
      }

      // --- Bills & Invoices ---
      if (can("Bill Show All")) {
        const billChildren = [
          { name: this.$t("sidebar.billsDashboard"), path: "/platform/bills-dashboard" },
          { name: this.$t("sidebar.allBills"),       path: "/platform/apps/bills" },
        ];
        items.push({
          name: this.$t("sidebar.billsInvoices"),
          icon: "fas fa-file-invoice-dollar",
          children: billChildren,
        });
      }

      // --- Reports ---
      if (can("Reports Show All")) {
        const reportChildren = [
          { name: this.$t("sidebar.reportInvoiceDelivery"), path: "/platform/bills/reports" },
          { name: this.$t("sidebar.reportDepartments"),    path: "/platform/reports/departments" },
          { name: this.$t("sidebar.reportSuppliers"),      path: "/platform/reports/suppliers" },
          { name: this.$t("sidebar.reportUsers"),          path: "/platform/reports/users" },
        ];
        items.push({
          name: this.$t("sidebar.reports"),
          icon: "fas fa-chart-bar",
          children: reportChildren,
        });
      }

      // --- Procurement ---
      if (can("Procurement Show All")) {
        items.push({
          name: this.$t("sidebar.procurement"),
          path: "/platform/apps/procurement",
          icon: "fas fa-shopping-cart",
        });
      }

      // --- Directory (Companies, Departments, Suppliers) ---
      const directoryChildren = [];
      if (can("Company Show All"))     directoryChildren.push({ name: this.$t("sidebar.companies"),   path: "/platform/companies" });
      if (can("Departments Show All")) directoryChildren.push({ name: this.$t("sidebar.departments"), path: "/platform/departments" });
      if (can("Supplier Show All"))    directoryChildren.push({ name: this.$t("sidebar.suppliers"),   path: "/platform/suppliers" });
      if (directoryChildren.length) {
        items.push({
          name: this.$t("sidebar.directory"),
          icon: "fas fa-sitemap",
          children: directoryChildren,
        });
      }

      // --- Management (Users, Roles, Permissions, Workflows, Business Roles) ---
      const mgmtChildren = [];
      if (can("Users Show All"))      mgmtChildren.push({ name: this.$t("sidebar.allUsers"),    path: "/platform/users" });
      if (can("Roles Show All"))      mgmtChildren.push({ name: this.$t("sidebar.roles"),       path: "/platform/roles" });
      if (can("Permissions Show All"))mgmtChildren.push({ name: this.$t("sidebar.permissions"), path: "/platform/permissions" });
      if (can("Super Admin"))         mgmtChildren.push({ name: this.$t("sidebar.workflows"),   path: "/platform/workflows" });
      if (can("Super Admin"))         mgmtChildren.push({ name: "AI Settings",                  path: "/platform/ai-settings" });
      if (can("App Roles Manage"))    mgmtChildren.push({ name: this.$t("sidebar.businessRoles"), path: "/platform/app-roles" });
      if (mgmtChildren.length) {
        items.push({
          name: this.$t("sidebar.management"),
          icon: "fas fa-cogs",
          children: mgmtChildren,
        });
      }

      return items;
    },
  },
  data() {
    return {};
  },
};
