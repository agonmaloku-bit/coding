import { createRouter, createWebHistory } from "vue-router";
import NProgress from "nprogress";
import Store from "../Store/index";
import Main from "../Modules/Main/Main.vue";

import Dashboard from "../Pages/Dashboard/Dashboard.vue";
import Blank from "../Pages/Blank/Blank.vue";
import Departments from "../Pages/Departments/Departments.vue";
import Companies from "../Pages/Companies/Companies.vue";
import Contracts from "../Pages/Contracts/Contracts.vue";

//added new
import Bills from "../Pages/Bills/Bills.vue";
import Suppliers from "../Pages/Suppliers/Suppliers.vue";
import Workflows from "../Pages/Workflows/Workflows.vue";
import AppHub from "../Pages/AppHub/AppHub.vue";
import ProcurementProcess from "../Pages/ProcurementProcess/ProcurementProcess.vue";
import AppRoles from "../Pages/AppRoles/AppRoles.vue";
import EmployeePortal from "../Pages/EmployeePortal/EmployeePortal.vue";
import GeneralTickets from "../Pages/GeneralTickets/GeneralTickets.vue";
import WorkOrders from "../Pages/WorkOrders/WorkOrders.vue";
import QualityService from "../Pages/QualityService/QualityService.vue";

import ContractsArchive from "../Pages/ContractsArchive/ContractsArchive.vue";
import ContractTypes from "../Pages/ContractTypes/ContractTypes.vue";
import ContractTemplates from "../Pages/ContractTemplates/ContractTemplates.vue";
import ResponsiblePerson from "../Pages/ResponsiblePerson/ResponsiblePerson.vue";
import ProcurementOfficer from "../Pages/ProcurementOfficer/ProcurementOfficer.vue";
import DirectorDepartment from "../Pages/DirectorDepartment/DirectorDepartment.vue";
import ExecutiveDirector from "../Pages/ExecutiveDirector/ExecutiveDirector.vue";
import LegalOffice from "../Pages/LegalOffice/LegalOffice.vue";
import Users from "../Pages/Users/Users.vue";
import Roles from "../Pages/Roles/Roles.vue";
import Permissions from "../Pages/Permissions/Permissions.vue";
import ContractDashboard from "../Pages/ContractDashboard/ContractDashboard.vue";
import BillsDashboard from "../Pages/BillsDashboard/BillsDashboard.vue";
import BillReports from "../Pages/BillReports/BillReports.vue";
import AggregateReport from "../Pages/Reports/AggregateReport.vue";
import AiSettings from "../Pages/AiSettings/AiSettings.vue";

import Profile from "../Pages/Profile/Profile.vue";
import Login from "../Modules/Login/Login.vue";
import Register from "../Modules/Register/Register.vue";
import NotFound from "../Modules/NotFound/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: "/login",
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/platform",
    name: "Main",
    component: Main,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: Dashboard,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/blank",
        name: "Blank",
        component: Blank,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/departments",
        name: "departments",
        component: Departments,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/companies",
        name: "companies",
        component: Companies,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/suppliers",
        name: "suppliers",
        component: Suppliers,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/contracts",
        name: "contracts",
        component: Contracts,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/contract-dashboard",
        name: "contract_dashboard",
        component: ContractDashboard,
        meta: { requiresAuth: true },
      },
      {
        path: "/platform/bills-dashboard",
        name: "bills_dashboard",
        component: BillsDashboard,
        meta: { requiresAuth: true },
      },
      {
        path: "/platform/contracts/archive",
        name: "contracts_archive",
        component: ContractsArchive,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/contract_types",
        name: "contract_types",
        component: ContractTypes,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/contract_templates",
        name: "contract_templates",
        component: ContractTemplates,
        meta: { requiresAuth: true },
      },
      {
        path: "/platform/users/responsible_persons",
        name: "responsible_persons",
        component: ResponsiblePerson,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/users/procurement_officer",
        name: "procurement_officer",
        component: ProcurementOfficer,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/users/director_departments",
        name: "director_departments",
        component: DirectorDepartment,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/users/executive_director",
        name: "executive_director",
        component: ExecutiveDirector,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/users/legal_office",
        name: "legal_office",
        component: LegalOffice,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/users",
        name: "users",
        component: Users,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/roles",
        name: "roles",
        component: Roles,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/permissions",
        name: "permissions",
        component: Permissions,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/profile",
        name: "Profile",
        component: Profile,
        meta: {
          requiresAuth: true,
        },
      },
      // added
      {
        path: "/platform/workflows",
        name: "workflows",
        component: Workflows,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/ai-settings",
        name: "ai_settings",
        component: AiSettings,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/apps",
        name: "app_hub",
        component: AppHub,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/apps/contracts",
        name: "apps_contract_process",
        component: Contracts,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/apps/bills",
        name: "apps_bills_invoice",
        component: Bills,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/bills/reports",
        name: "bills_reports",
        component: BillReports,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/reports/departments",
        name: "report_departments",
        component: AggregateReport,
        props: { type: "departments" },
        meta: { requiresAuth: true },
      },
      {
        path: "/platform/reports/suppliers",
        name: "report_suppliers",
        component: AggregateReport,
        props: { type: "suppliers" },
        meta: { requiresAuth: true },
      },
      {
        path: "/platform/reports/users",
        name: "report_users",
        component: AggregateReport,
        props: { type: "users" },
        meta: { requiresAuth: true },
      },
      {
        path: "/platform/apps/procurement",
        name: "apps_procurement",
        component: ProcurementProcess,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/apps/employee-portal",
        name: "apps_employee_portal",
        component: EmployeePortal,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/apps/general-tickets",
        name: "apps_general_tickets",
        component: GeneralTickets,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/apps/work-orders",
        name: "apps_work_orders",
        component: WorkOrders,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/apps/quality-of-service",
        name: "apps_quality_service",
        component: QualityService,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/platform/app-roles",
        name: "app_roles",
        component: AppRoles,
        meta: {
          requiresAuth: true,
        },
      },
      // added
      {
        path: "/platform/bill",
        name: "Fatura",
        component: Bills,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/NotFound",
    name: "NotFound",
    component: NotFound,
    meta: {
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeResolve((to, from, next) => {
  if (to.name) {
    NProgress.start();
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !Store.state.auth.status.loggedIn) {
    next("/login");
  } else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (!to.matched.length) {
    next("/NotFound");
  } else {
    next();
  }
});

export default router;
