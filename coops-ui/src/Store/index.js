import { createStore, createLogger } from "vuex";
import { auth } from "./Modules/Auth/Auth";
import UI from "./Modules/UI/UI";
import departments from "./Modules/Department/Department";
import companies from "./Modules/Company/Company";
import contracts from "./Modules/Contract/Contract";
import contracts_archive from "./Modules/ContractArchive/ContractArchive";
import contract_types from "./Modules/ContractType/ContractType";
import responsible_person from "./Modules/ResponsiblePerson/ResponsiblePerson";
import procurement_officer from "./Modules/ProcurementOfficer/ProcurementOfficer";
import director_department from "./Modules/DirectorDepartment/DirectorDepartment";
import executive_director from "./Modules/ExecutiveDirector/ExecutiveDirector";
import legal_office from "./Modules/LegalOffice/LegalOffice";
import users from "./Modules/User/User";
import roles from "./Modules/Role/Role";
import permissions from "./Modules/Permission/Permission";
import bills from "./Modules/Bill/Bill";
import suppliers from "./Modules/Supplier/Supplier";
import workflow_templates from "./Modules/WorkflowTemplate/WorkflowTemplate";
import contract_templates from "./Modules/ContractTemplate/ContractTemplate";

const debug = process.env.NODE_ENV !== "production";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    ui: UI,
    auth,
    departments,
    companies,
    suppliers,
    bills,
    contracts,
    contracts_archive,
    contract_types,
    contract_templates,
    responsible_person,
    procurement_officer,
    director_department,
    executive_director,
    legal_office,
    users,
    roles,
    permissions,
    workflow_templates,
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
