import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import { mapGetters, mapActions } from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from "@/Components/vue-multiselect/src";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import CurrencyInput from "../../Components/CurrencyInput/CurrencyInput.vue";
import {
  BILL_LIST_GETTER,
  BILLS_PAGINATED_DATA_GETTER,
  BILL_GETTER,
  NEW_BILL_GETTER,
  FIRST_TIME_LOADED_GETTER,
  IS_LOADING_ALL_GETTER,
  IS_LOADING_GETTER,
  IS_CREATING_GETTER,
  CREATED_DATA_GETTER,
  IS_UPDATING_GETTER,
  UPDATED_DATA_GETTER,
  ERRORS_GETTER,
  FETCH_ALL_BILLS_ACTION,
  FETCH_DETAIL_BILL_ACTION,
  STORE_BILL_ACTION,
  UPDATE_BILL_ACTION,
  DELETE_BILL_ACTION,
  REMOVE_FILE_ACTION,
  ADD_BILL_INPUT_ACTION,
  UPDATE_BILL_INPUT_ACTION,
  SET_ERRORS_ACTION,
} from "@/Store/Modules/Bill/constants";
import {
  FETCH_ALL_USERS_ACTION,
  USER_LIST_GETTER,
} from "../../Store/Modules/User/constants";
import {
  DEPARTMENT_LIST_GETTER,
  FETCH_ALL_DEPARTMENTS_ACTION,
} from "../../Store/Modules/Department/constants";
import {
  SUPPLIER_LIST_GETTER,
  FETCH_ALL_SUPPLIERS_ACTION,
} from "../../Store/Modules/Supplier/constants";
import { RESPONSIBLE_PERSON_LIST_GETTER } from "../../Store/Modules/ResponsiblePerson/constants";
import { BILL_PERMISSIONS } from "../../Constants/permissions";
import { PROCUREMENT_OFFICER_LIST_GETTER } from "../../Store/Modules/ProcurementOfficer/constants";
// import { canGivenRolesHaveAccess } from "../../Roles/role.logic";
import { ROLES } from "../../Roles/roles";
import ContractDataService from "../../Services/ContractDataService";
import BillDataService from "../../Services/BillDataService";
import writeXlsxFile from "write-excel-file/browser";
import BillCard from "../../Components/BillWorkflow/BillCard.vue";
import AiDataService from "../../Services/AiDataService";
import BillWorkflowDrawer from "../../Components/BillWorkflow/BillWorkflowDrawer.vue";

export default {
  name: "Bills",
    mixins: [dirtyGuard],
  components: {
    "content-header": ContentHeader,
    "breadcrumb-item": BreadcrumbItem,
    "page-content": Content,
    VPagination,
    VueMultiselect,
    flatPickr,
    "app-currency-input": CurrencyInput,
    "bill-card": BillCard,
    "bill-workflow-drawer": BillWorkflowDrawer,
  },
  data() {
    return {
      showRequiredMessageForComment: false,
      showRequiredMessageForFile: false,
      approvalComment: "",
      approvalFile: null,
      modalAddActive: false,
      modalInfoActive: false,
      modalEditActive: false,
      modalAtthacmentsActive: false,
      modalRequestActive: false,
      pagination: {
        total: 0,
        page: 1,
      },
      query: {
        page: 1,
        search: {
          status: { id: 0, name: "All" },
          // status: { id: [1,2,3,4], name: "ALL" },
          // status: { id: 1, name: 'Requested' },
          sort: "DESC",
          orderBy: { id: "id", name: "Id" },
          text: null,
        },
      },
      selectNotifyDay: null,
      editNotifyDay: null,
      search: false,
      daysList: ["15", "30", "45", "60", "90", "120", "160", "180"],
      statusList: [
        { name: "REQUESTED", id: 1 },
        { name: "PENDING", id: 2 },
        { name: "APPROVED FROM CEO", id: 3 },
        { name: "CANCELED", id: 4 },
        { name: "APPROVED FROM ADMIN", id: 5 },
        { name: "Printed & Closed", id: 6 },
        { name: "Delivered to Finances", id: 7 },
        { name: "ALL (TE GJITHA)", id: 8 },
      ],
      stepList: [
        { name: "Step 1", id: 1 },
        { name: "Step 2", id: 2 },
        { name: "Step 3", id: 3 },
        { name: "Step 4", id: 4 },
        { name: "Step 5", id: 5 },
        { name: "Step 6", id: 6 },
      ],
      searchStatusList: [
        // { id: 'ALL', name: 'ALL' },
        { name: "TE GJITHA", id: 0 },
        { name: "REQUESTED", id: 1 },
        { name: "PENDING", id: 2 },
        { name: "APPROVED FROM CEO", id: 3 },
        { name: "CANCELED", id: 4 },
        { name: "APPROVED FROM ADMIN", id: 5 },
        { name: "Printed & Closed", id: 6 },
        { name: "Delivered to Finances", id: 7 },
      ],
      sortList: ["ASC", "DESC"],
      orderByList: [
        { id: "id", name: "Id" },
        { id: "bill_no", name: "Bill Number" },
        { id: "name", name: "Name" },
        { id: "created_by", name: "Porositi" },
        { id: "supplier", name: "Supplier" },
        { id: "value", name: "Value" },
      ],

      today: new Date(),
      config: {
        wrap: true,
        altFormat: "M j, Y",
        altInput: true,
        dateFormat: "Y-m-d",
      },
      priceConfig: {
        currency: "EUR",
        valueRange: { min: 1, max: 1000000000 },
        hideCurrencySymbolOnFocus: false,
      },
      canShowAll: false,
      canShow: false,
      canAdd: false,
      canRequest: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canAiVerify: false,
      canPrintAll: false,
      canBillAttachments: false,
      canShowSuppliers: false,
      canAddSupplier: false,
      canGenerateReport: false,
      selectedBillIds: [],
      isGeneratingReport: false,
      labelFilesNameInsert: "Choose a file",
      labelFilesName: "Choose a file",
      labelFilesNameRequest: "Choose a file",
      clicked: false,
      allRoles: ROLES,
      billsEdited: [],
      cE: false,
      supplierContracts: [],
      loadingContracts: false,
      selectedSupplierNoContract: false,
      cameraStream: null,
      showCamera: false,
      capturedImage: null,
      // Phase 2 — modern view modes & workflow drawer
      viewMode: (() => {
        const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('bills.viewMode')) || 'cards';
        // On phones the table view is unusable — fall back to cards.
        if (saved === 'table' && typeof window !== 'undefined' && window.innerWidth < 768) return 'cards';
        return saved;
      })(),
      workflowDrawerOpen: false,
      workflowTimeline: [],
      workflowTimelineLoading: false,
      workflowDrawerBusy: false,
      // AI verification panel state for the info modal
      aiEnabled: true, // toggle hides the button if false; refreshed once on mount
      aiVerify: {
        show: false,
        loading: false,
        severity: null,        // ok | warn | block | error | pending
        message: null,
        findings: [],
        extracted: null,
      },
      aiExtract: {
        show: false,
        loading: false,
        severity: null,
        message: null,
        applied: [],            // [{ field, value }]
        raw: null,
      },
    };
  },
  // mounted() {
  //   // this.fetchData();
  //   document.addEventListener("click", this.handleOutsideClick);
  // },
  // beforeUnmount() {
  //   // Remove the global click event listener when the component is about to be unmounted
  //   document.removeEventListener("click", this.handleOutsideClick);
  // },
  computed: {
    ...mapGetters("bills", {
      bill: BILL_GETTER,
      newBill: NEW_BILL_GETTER,
      billList: BILL_LIST_GETTER,
      billsPaginatedData: BILLS_PAGINATED_DATA_GETTER,
      createdData: CREATED_DATA_GETTER,
      updatedData: UPDATED_DATA_GETTER,
      isLoadingAll: IS_LOADING_ALL_GETTER,
      firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
      isLoading: IS_LOADING_GETTER,
      isCreating: IS_CREATING_GETTER,
      isUpdating: IS_UPDATING_GETTER,
      errors: ERRORS_GETTER,
      billApprove: "billApprove",
      billCancel: "billCancel",
    }),

    ...mapGetters("users", {
      userList: USER_LIST_GETTER,
    }),

    ...mapGetters("departments", {
      departmentList: DEPARTMENT_LIST_GETTER,
    }),
    ...mapGetters("suppliers", {
      supplierList: SUPPLIER_LIST_GETTER,
    }),

    ...mapGetters("responsible_person", {
      responsible_personList: RESPONSIBLE_PERSON_LIST_GETTER,
    }),

    ...mapGetters("procurement_officer", {
      procurement_officerList: PROCUREMENT_OFFICER_LIST_GETTER,
    }),

    isModalActive() {
      return this.$store.getters["ui/modalActive"];
    },

    kanbanColumns() {
      const items = (this.billsPaginatedData && this.billsPaginatedData.data) || [];
      const cols = [
        { id: 1, key: 'request',   label: 'Requested',            icon: 'fa-paper-plane',   items: [] },
        { id: 2, key: 'progress',  label: 'Pending',              icon: 'fa-spinner',       items: [] },
        { id: 3, key: 'approved',  label: 'Approved by CEO',      icon: 'fa-user-check',    items: [] },
        { id: 6, key: 'archived',  label: 'Printed & Closed',     icon: 'fa-print',         items: [] },
        { id: 7, key: 'delivered', label: 'Delivered to Finances',icon: 'fa-truck-loading', items: [] },
      ];
      const byId = {};
      cols.forEach(c => { byId[c.id] = c; });
      items.forEach(it => {
        // Status 4 (Canceled) and 5 (Approved Admin) are intentionally not
        // displayed as kanban columns per product spec.
        const target = byId[it.status];
        if (target) target.items.push(it);
      });
      return cols;
    },

    selectStep: {
      get: function () {
        if (this.newBill != null) {
          if (this.newBill["step"] != null) {
            return this.newBill.step;
          }
        }
        return null;
      },
      set: function (step) {
        this.addStepForBillAction(step);
      },
    },

    selectBillType: {
      get: function () {
        if (this.newBill != null) {
          if (this.newBill["bill_type"] != null) {
            return this.newBill.bill_type;
          }
        }
        return null;
      },
      set: function (bill_type) {
        this.addBillTypeForBillAction(bill_type);
      },
    },
    selectCompany: {
      get: function () {
        if (this.newBill != null) {
          if (this.newBill["company"] != null) {
            return this.newBill.company;
          }
        }
        return null;
      },
      set: function (company) {
        if (company != null) {
          this.addCompanyForBillAction(company);
          this.getDepartmentByCompanyId(company.id);
        }
        this.setDepartmentForCompanyNullAction();
      },
    },
    deadline_from: {
      get: function () {
        if (this.newBill != null) {
          if (this.newBill["deadline_from"] != null) {
            return this.newBill.deadline_from;
          }
        }
        return null;
      },
      set: function (deadline_from) {
        this.addDeadlineFromForBillAction(deadline_from);
      },
    },
    deadline_to: {
      get: function () {
        if (this.newBill != null) {
          if (this.newBill["deadline_to"] != null) {
            return this.newBill.deadline_to;
          }
        }
        return null;
      },
      set: function (deadline_to) {
        this.addDeadlineToForBillAction(deadline_to);
      },
    },
    selecteNewDepartments: {
      get: function () {
        if (this.newBill != null) {
          if (this.newBill["departments"] != null) {
            // console.log(this.newBill.departments, "this.newBill.departments");

            return this.newBill.departments;
          }
        }
        return null;
      },
      set: function (departments) {
        // alert("asd");
        //let depIds = departments.map(a => a.id);
        // console.log(departments, "departments");
        if (departments != null) {
          this.addDepartmentsForBillAction(departments);
        }
      },
    },
    selecteNewSuppliers: {
      get: function () {
        if (this.newBill != null) {
          if (this.newBill["suppliers"] != null) {
            return this.newBill.suppliers;
          }
        }
        return null;
      },
      set: function (suppliers) {
        // alert("asd");
        //let depIds = suppliers.map(a => a.id);

        if (suppliers != null) {
          this.addSuppliersForBillAction(suppliers);
          // Load contracts for the selected supplier
          this.loadContractsForSupplier(suppliers);
        } else {
          this.supplierContracts = [];
          this.selectedSupplierNoContract = false;
          this.newBill.contract = null;
        }
      },
    },
    selectedNewContract: {
      get: function () {
        if (this.newBill != null && this.newBill["contract"] != null) {
          return this.newBill.contract;
        }
        return null;
      },
      set: function (contract) {
        if (this.newBill) {
          this.newBill.contract = contract;
        }
      },
    },
    // selectResponsiblePerson: {
    //   get: function () {
    //     if (this.newBill != null) {
    //       if (this.newBill["responsible_person"] != null) {
    //         return this.newBill.responsible_person;
    //       }
    //     }
    //     return null;
    //   },
    //   set: function (responsible_person) {
    //     this.addResponsiblePersonForBillAction(responsible_person);
    //   },
    // },
    // selectTotalPrice: {
    //   get: function () {
    //     if (this.newBill != null) {
    //       if (
    //         this.newBill["total_price"] != null ||
    //         this.newBill["total_price"] != undefined
    //       ) {
    //         return this.newBill.total_price;
    //       }
    //     }
    //   },
    //   set: function (value) {
    //     this.addTotalPriceForBillAction(value);
    //   },
    // },
    // selectUnitPrice: {
    //   get: function () {
    //     if (this.newBill != null) {
    //       if (this.newBill["unit_price"] != null) {
    //         return this.newBill.unit_price;
    //       }
    //     }
    //   },
    //   set: function (value) {
    //     this.addUnitPriceForBillAction(value);
    //   },
    // },
    // selectPaymentDate: {
    //   get: function () {
    //     if (this.newBill != null) {
    //       if (this.newBill["payment_date"] != null) {
    //         return this.newBill.payment_date;
    //       }
    //     }
    //     return null;
    //   },
    //   set: function (payment_date) {
    //     this.addPaymentDateForBillAction(payment_date);
    //   },
    // },
    editStatus: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["status"] != null) {
            if (this.bill.status.id !== undefined) {
              return this.bill.status;
            } else {
              return this.statusList.filter((s) => s.id === this.bill.status);
            }
          }
        }
        return null;
      },
      set: function (status) {
        this.editStatusForBillAction(status);
      },
    },
    editStep: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["step"] != null) {
            if (this.bill.step.id !== undefined) {
              return this.bill.step;
            } else {
              return {
                name: `Step ${this.bill.step}`,
                id: this.bill.step,
              };
            }
          }
        }
        return null;
      },
      set: function (step) {
        this.editStepForBillAction(step);
      },
    },
    editBillType: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["bill_type"] != null) {
            return this.bill.bill_type;
          }
        }
        return null;
      },
      set: function (bill_type) {
        this.editBillTypeForBillAction(bill_type);
      },
    },
    editDeadline_from: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["deadline_from"] != null) {
            return this.bill.deadline_from;
          }
        }
        return null;
      },
      set: function (deadline_from) {
        this.editDeadlineFromForBillAction(deadline_from);
      },
    },
    editDeadline_to: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["deadline_to"] != null) {
            return this.bill.deadline_to;
          }
        }
        return null;
      },
      set: function (deadline_to) {
        this.editDeadlineToForBillAction(deadline_to);
      },
    },
    editCompany: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["company"] != null) {
            return this.bill.company;
          } else {
            if (this.bill.responsible_person["department"] != null) {
              if (this.bill.responsible_person.department["company"] != null) {
                return this.bill.responsible_person.department.company;
              }
            }
          }
        }
        return null;
      },
      set: function (company) {
        if (company != null) {
          this.editCompanyForBillAction(company);
          this.getDepartmentByCompanyId(company.id);
        }
        this.setDepartmentForCompanyEditNullAction();
      },
    },
    editDepartment: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["assigned_dep_id"] != null) {
            return this.bill.assigned_dep_id.name;
          }
        }
        return null;
      },
      set: function (department) {
        this.editDepartmentForBillAction(department);
        this.getResponsiblePersonsByDepartmentId(department.id);
        this.editResponsiblePersonForBillAction(null);
      },
    },
    editResponsiblePerson: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["responsible_person"] != null) {
            return this.bill.responsible_person;
          }
        }
        return null;
      },
      set: function (responsible_person) {
        this.editResponsiblePersonForBillAction(responsible_person);
      },
    },
    editTotalPrice: {
      get: function () {
        if (this.bill != null) {
          if (
            this.bill["total_price"] != null ||
            this.bill["total_price"] != undefined
          ) {
            return this.bill.total_price;
          }
        }
      },
      set: function (value) {
        this.editTotalPriceForBillAction(value);
      },
    },
    editUnitPrice: {
      get: function () {
        if (this.bill != null) {
          if (
            this.bill["unit_price"] != null ||
            this.bill["unit_price"] != undefined
          ) {
            return this.bill.unit_price;
          }
        }
      },
      set: function (value) {
        this.editUnitPriceForBillAction(value);
      },
    },
    editPaymentDate: {
      get: function () {
        if (this.bill != null) {
          if (this.bill["payment_date"] != null) {
            return this.bill.payment_date;
          }
        }
        return null;
      },
      set: function (payment_date) {
        this.editPaymentDateForBillAction(payment_date);
      },
    },
    user() {
      return this.$store.getters["auth/user"];
    },
    rolePermissions() {
      return this.$store.getters["auth/rolePermissions"];
    },
    directPermissions() {
      return this.$store.getters["auth/directPermissions"];
    },
    files() {
      return this.bill.files.filter((f) => f.deleted_at === null);
    },
    filesDeleted() {
      return this.bill.files.filter((f) => f.deleted_at !== null);
    },
    filesToDeleted() {
      return this.bill.files_deleted;
    },
    searchCompany: {
      get: function () {
        return this.query.search.company;
      },
      set: function (value) {
        this.query.search.company = value;
        if (value != null) {
          this.getDepartmentByCompanyId(value.id);
        }
        this.query.search.department = null;
        this.query.search.procurement_officer = null;
        this.query.search.responsible_person = null;
      },
    },
    searchDepartment: {
      get: function () {
        return this.query.search.department;
      },
      set: function (value) {
        this.query.search.department = value;
        if (value != null) {
          this.getProcurementOfficerByDepartmentId(value.id);
          this.getResponsiblePersonsByDepartmentId(value.id);
        }
        this.query.search.procurement_officer = null;
        this.query.search.responsible_person = null;
      },
    },
    searchProcurementOfficer: {
      get: function () {
        return this.query.search.procurement_officer;
      },
      set: function (value) {
        this.query.search.procurement_officer = value;
      },
    },
    searchResponsiblePerson: {
      get: function () {
        return this.query.search.responsible_person;
      },
      set: function (value) {
        this.query.search.responsible_person = value;
      },
    },
    searchSupplier: {
      get: function () {
        return this.query.search.suppliers;
      },
      set: function (value) {
        this.query.search.suppliers = value;
      },
    },
    searchBillType: {
      get: function () {
        return this.query.search.bill_type;
      },
      set: function (value) {
        this.query.search.bill_type = value;
      },
    },
    hasInsertFiles() {
      // Reactive proxy: labelFilesNameInsert changes whenever the user picks/clears files.
      if (!this.labelFilesNameInsert || this.labelFilesNameInsert === 'Choose a file') return false;
      try {
        const f = this.$refs.filesInsert && this.$refs.filesInsert.files;
        return !!(f && f.length);
      } catch (e) { return false; }
    },
  },
  methods: {
    ...mapActions("bills", {
      fetchAllBills: FETCH_ALL_BILLS_ACTION,
      fetchDetailBill: FETCH_DETAIL_BILL_ACTION,
      storeBill: STORE_BILL_ACTION,
      requestBill: "requestBillAction",
      updateBill: UPDATE_BILL_ACTION,
      addBillInput: ADD_BILL_INPUT_ACTION,
      updateBillInput: UPDATE_BILL_INPUT_ACTION,
      deleteBill: DELETE_BILL_ACTION,
      RemoveFile: REMOVE_FILE_ACTION,
      setErrors: SET_ERRORS_ACTION,

      addStepForBillAction: "addStepForBillAction",
      addBillTypeForBillAction: "addBillTypeForBillAction",
      addCompanyForBillAction: "addCompanyForBillAction",
      addDeadlineFromForBillAction: "addDeadlineFromForBillAction",
      addDeadlineToForBillAction: "addDeadlineToForBillAction",
      addResponsiblePersonForBillAction: "addResponsiblePersonForBillAction",
      addTotalPriceForBillAction: "addTotalPriceForBillAction",
      addUnitPriceForBillAction: "addUnitPriceForBillAction",
      addPaymentDateForBillAction: "addPaymentDateForBillAction",
      addDepartmentsForBillAction: "addDepartmentsForBillAction",
      addSuppliersForBillAction: "addSuppliersForBillAction",

      editStatusForBillAction: "editStatusForBillAction",
      editStepForBillAction: "editStepForBillAction",
      editBillTypeForBillAction: "editBillTypeForBillAction",
      editCompanyForBillAction: "editCompanyForBillAction",
      editDeadlineFromForBillAction: "editDeadlineFromForBillAction",
      editDeadlineToForBillAction: "editDeadlineToForBillAction",
      editResponsiblePersonForBillAction: "editResponsiblePersonForBillAction",
      editTotalPriceForBillAction: "editTotalPriceForBillAction",
      editUnitPriceForBillAction: "editUnitPriceForBillAction",
      editPaymentDateForBillAction: "editPaymentDateForBillAction",
      editDepartmentForBillAction: "editDepartmentForBillAction",
      editSupplierForBillAction: "editSupplierForBillAction",

      getBillAttachments: "getBillAttachments",

      updateBillFilesToDelete: "updateBillFilesToDelete",
      updateBillFilesToRestore: "updateBillFilesToRestore",
      updateBillFilesFromRestoreToDelete: "updateBillFilesFromRestoreToDelete",
      updateBillFilesToRestoreFromDeleted:
        "updateBillFilesToRestoreFromDeleted",
      updateBillFilesToDeletePermanent: "updateBillFilesToDeletePermanent",

      approveBill: "approveBill",
      resetBillApprove: "resetBillApprove",
      cancelBill: "cancelBill",
      resetBillCancel: "resetBillCancel",
      fetchBillTimeline: "fetchBillTimeline",

      setDepartmentForCompanyNullAction: "setDepartmentForCompanyNullAction",
      setDepartmentForCompanyEditNullAction:
        "setDepartmentForCompanyEditNullAction",
      exportBillsToExcel: "exportBillsToExcel",
    }),

    async exportOnExcel() {
      const excelCell = (value, options = {}) => ({ value: value == null ? "" : value, ...options });
      const header = [
        "#", "LLoji", "Vlera", "Nr i faturës", "Departamenti", "Pranoi nga dep",
        "Furnitori", "Krijuar nga", "Data", "Step", "Status"
      ].map((value) => excelCell(value, { fontWeight: "bold" }));

      const rows = this.billsPaginatedData.data.map((item, index) => [
        excelCell(this.query.page * 10 - 10 + (index + 1)),
        excelCell(item.type),
        excelCell(item.value),
        excelCell(item.bill_no),
        excelCell(item.assigned_dep_id),
        excelCell(item.updated_by),
        excelCell(item.supplier),
        excelCell(`${item.created_by.first_name} ${item.created_by.last_name}`),
        excelCell(new Date(item.created_at).toLocaleDateString()),
        excelCell(`Step ${item.step}`),
        excelCell(this.checkBillStatus(item.status)),
      ]);

      await writeXlsxFile([header, ...rows], {
        fileName: "Fatura.xlsx",
        sheet: "Bills",
        columns: [
          { width: 8 },
          { width: 14 },
          { width: 14 },
          { width: 18 },
          { width: 18 },
          { width: 18 },
          { width: 24 },
          { width: 24 },
          { width: 14 },
          { width: 12 },
          { width: 18 },
        ]
      });
    },
    ...mapActions("users", {
      fetchAllUsers: FETCH_ALL_USERS_ACTION,
    }),
    ...mapActions("departments", {
      fetchAllDepartments: FETCH_ALL_DEPARTMENTS_ACTION,
      getDepartmentByCompanyId: "getDepartmentByCompanyId",
    }),
    ...mapActions("suppliers", {
      fetchAllSuppliers: FETCH_ALL_SUPPLIERS_ACTION,
      // getSupplierByCompanyId: "getSupplierByCompanyId",
    }),
    ...mapActions("responsible_person", {
      getResponsiblePersonsByDepartmentId:
        "getResponsiblePersonsByDepartmentId",
    }),
    ...mapActions("procurement_officer", {
      getProcurementOfficerByDepartmentId:
        "getProcurementOfficerByDepartmentId",
    }),
    handleModalClick(event) {
      // Check if the clicked element should close the modal
      if (!event.target.classList.contains("specific-close-element")) {
        event.stopPropagation();
      } else {
        this.closeModal();
      }
    },
    handleOutsideClick(event) {
      const clickedElementId = event.target.id;
      const modalIds = ["modal-edit", "modal-info", "modal-another"]; // Add the IDs of your modals
      if (!modalIds.includes(clickedElementId)) {
        event.stopPropagation();
      }
    },
    closeModal() {
      this.$store.dispatch("ui/setModalActive", false);
      this.modalAddActive = false;
      this.modalRequestActive = false;
      this.modalInfoActive = false;
      this.modalEditActive = false;
      this.modalAtthacmentsActive = false;
      this.labelFilesNameInsert = "Choose a file";
      this.labelFilesName = "Choose a file";
      this.labelFilesNameRequest = "Choose a file";
      this.$store.commit("bills/setNewBillInputNull");
      this.closeCamera();
      this.supplierContracts = [];
      this.selectedSupplierNoContract = false;
      // Reset AI panels
      this.aiVerify = { show: false, loading: false, severity: null, message: null, findings: [], extracted: null };
      this.aiExtract = { show: false, loading: false, severity: null, message: null, applied: [], raw: null };
    },
    showAddModal() {
      this.fetchAllDepartments();
      if (this.canShowSuppliers) this.fetchAllSuppliers();
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      this.setErrors(null);
      // this.fetchAllBillTypes();
      // this.fetchAllCompanies();
      return (this.modalAddActive = !this.modalAddActive);
    },
    showRequestModal() {
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      this.setErrors(null);
      this.fetchAllCompanies();
      if (this.canShowSuppliers) this.fetchAllSuppliers();
      if (this.user.roles !== undefined) {
        if (this.user.roles[0].name == "Procurement Officer") {
          this.getDepartmentByCompanyId(this.user.department.company.id);
          this.getResponsiblePersonsByDepartmentId(this.user.department_id);
        } else if (this.user.roles[0].name == "Director Department") {
          this.getDepartmentByCompanyId(this.user.department.company.id);
          this.getResponsiblePersonsByDepartmentId(this.user.department_id);
        } else {
          this.fetchAllDepartments();
        }
      } else {
        this.fetchAllDepartments();
      }
      return (this.modalRequestActive = true);
    },
    showInfoModal(id) {
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      this.fetchDetailBill(id);
      // load any previous AI check for this bill (best-effort, ignore errors)
      this.aiVerify = { show: false, loading: false, severity: null, message: null, findings: [], extracted: null };
      AiDataService.latestCheck(id).then((res) => {
        const d = (res && res.data && res.data.data) ? res.data.data : null;
        if (d) {
          this.aiVerify = {
            show: true,
            loading: false,
            severity: d.severity,
            message: 'Last verified ' + (d.created_at ? new Date(d.created_at).toLocaleString() : ''),
            findings: d.findings || [],
            extracted: d.extracted || null,
          };
        }
      }).catch(() => { /* noop */ });
      return (this.modalInfoActive = !this.modalInfoActive);
    },
    setViewMode(mode) {
      this.viewMode = mode;
      try { localStorage.setItem('bills.viewMode', mode); } catch (e) { /* noop */ }
    },
    async runAiVerify() {
      if (!this.bill || !this.bill.id) return;
      this.aiVerify = { show: true, loading: true, severity: 'pending', message: null, findings: [], extracted: null };
      try {
        const res = await AiDataService.verifyBill(this.bill.id);
        const d = (res && res.data && res.data.data) ? res.data.data : res.data;
        this.aiVerify = {
          show: true,
          loading: false,
          severity: d.severity || (d.ok ? 'ok' : 'error'),
          message: d.message || null,
          findings: d.findings || [],
          extracted: d.extracted || null,
        };
      } catch (e) {
        const msg = (e.response && e.response.data && (e.response.data.message || JSON.stringify(e.response.data))) || e.message || 'AI request failed.';
        this.aiVerify = { show: true, loading: false, severity: 'error', message: msg, findings: [], extracted: null };
      }
    },
    aiSeverityIcon(sev) {
      switch (sev) {
        case 'ok':      return 'fa-check-circle';
        case 'warn':    return 'fa-exclamation-triangle';
        case 'block':   return 'fa-times-circle';
        case 'error':   return 'fa-bug';
        case 'pending': return 'fa-spinner fa-spin';
        default:        return 'fa-magic';
      }
    },
    async runAiExtract() {
      const filesEl = this.$refs.filesInsert;
      const file = filesEl && filesEl.files && filesEl.files[0];
      if (!file) {
        this.aiExtract = { show: true, loading: false, severity: 'error', message: 'Please choose an invoice file first.', applied: [], raw: null };
        return;
      }
      this.aiExtract = { show: true, loading: true, severity: 'pending', message: 'Extracting fields…', applied: [], raw: null };
      try {
        const res = await AiDataService.extractBill(file);
        const d = (res && res.data && res.data.data) ? res.data.data : null;
        if (!d || !d.ok) {
          this.aiExtract = {
            show: true,
            loading: false,
            severity: (d && d.severity) || 'error',
            message: (d && d.message) || 'Extraction failed.',
            applied: [],
            raw: d,
          };
          return;
        }
        const e = d.extracted || {};
        const applied = this.applyExtractedToForm(e);
        this.aiExtract = {
          show: true,
          loading: false,
          severity: applied.length ? (d.severity || 'ok') : 'warn',
          message: applied.length ? d.message : 'Nothing usable was extracted from this file.',
          applied,
          raw: e,
        };
      } catch (err) {
        const msg = (err.response && err.response.data && (err.response.data.message || JSON.stringify(err.response.data))) || err.message || 'AI request failed.';
        this.aiExtract = { show: true, loading: false, severity: 'error', message: msg, applied: [], raw: null };
      }
    },
    applyExtractedToForm(e) {
      const applied = [];
      const setField = (name, value) => {
        if (value === null || value === undefined || value === '') return;
        // Mutate the store via the existing input mutation so the form stays consistent.
        try {
          this.$store.commit('bills/setBillAddInput', { target: { name, value: String(value) } });
          applied.push({ field: name, value: String(value) });
        } catch (_) { /* mutation key may differ — fall back to direct assign */
          if (this.newBill) this.newBill[name] = value;
          applied.push({ field: name, value: String(value) });
        }
      };
      // Supplier match (fuzzy substring, case-insensitive)
      if (e.supplier && Array.isArray(this.supplierList)) {
        const needle = String(e.supplier).toLowerCase().trim();
        const found = this.supplierList.find(s =>
          (s.name || '').toLowerCase() === needle ||
          (s.name || '').toLowerCase().includes(needle) ||
          needle.includes((s.name || '').toLowerCase())
        );
        if (found) {
          this.selecteNewSuppliers = found;
          applied.push({ field: 'supplier', value: found.name });
        } else {
          applied.push({ field: 'supplier (no match)', value: e.supplier });
        }
      }
      if (e.bill_no)     setField('bill_no', e.bill_no);
      if (e.value != null) setField('value', e.value);
      if (e.description) setField('description', e.description);
      return applied;
    },
    async openBillWorkflowDrawer(id) {
      this.$store.dispatch("ui/setModalActive", true);
      this.workflowDrawerOpen = true;
      this.workflowTimeline = [];
      this.workflowTimelineLoading = true;
      // Reset + preload any previous AI check for this bill
      this.aiVerify = { show: false, loading: false, severity: null, message: null, findings: [], extracted: null };
      AiDataService.latestCheck(id).then((res) => {
        const d = (res && res.data && res.data.data) ? res.data.data : null;
        if (d) {
          this.aiVerify = {
            show: true,
            loading: false,
            severity: d.severity,
            message: 'Last verified ' + (d.created_at ? new Date(d.created_at).toLocaleString() : ''),
            findings: d.findings || [],
            extracted: d.extracted || null,
          };
        }
      }).catch(() => { /* noop */ });
      await this.fetchDetailBill(id);
      try {
        this.workflowTimeline = await this.fetchBillTimeline(id);
      } finally {
        this.workflowTimelineLoading = false;
      }
    },
    closeWorkflowDrawer() {
      this.workflowDrawerOpen = false;
      this.$store.dispatch("ui/setModalActive", false);
      this.aiVerify = { show: false, loading: false, severity: null, message: null, findings: [], extracted: null };
    },
    async refreshDrawerData(id) {
      this.workflowTimelineLoading = true;
      await this.fetchDetailBill(id);
      try {
        this.workflowTimeline = await this.fetchBillTimeline(id);
      } finally {
        this.workflowTimelineLoading = false;
      }
    },
    async onDrawerApprove(payload) {
      if (!this.bill) return;
      const id = this.bill.id;
      this.workflowDrawerBusy = true;
      try {
        await this.approveBill({
          id,
          comment: payload.comment || 'No comment',
          file: payload.file || null,
        });
        await this.refreshDrawerData(id);
        await this.fetchAllBills(this.query);
      } finally {
        this.workflowDrawerBusy = false;
      }
    },
    async onDrawerCancel(payload) {
      if (!this.bill) return;
      const id = this.bill.id;
      this.workflowDrawerBusy = true;
      try {
        await this.cancelBill({ id, comment: payload.comment });
        await this.refreshDrawerData(id);
        await this.fetchAllBills(this.query);
      } finally {
        this.workflowDrawerBusy = false;
      }
    },
    async onDrawerComment(payload) {
      // Free-form comment + optional attachments via the bill update
      // endpoint, which now handles comment-only / file-only payloads.
      if (!this.bill) return;
      const id = this.bill.id;
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("id", id);
      if (payload.comment) fd.append("comment", payload.comment);
      if (payload.files && payload.files.length) {
        Array.from(payload.files).forEach(f => fd.append("files[]", f));
      }
      this.workflowDrawerBusy = true;
      try {
        await this.updateBill(fd);
        await this.refreshDrawerData(id);
      } finally {
        this.workflowDrawerBusy = false;
      }
    },
    onDrawerDownloadFile(file) {
      if (!file) return;
      const fileId = file.file_id || file.id;
      BillDataService.attachment(fileId).then((res) => {
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const ext = file.file_extension ? '.' + file.file_extension : '';
        link.setAttribute('download', (file.file_name || fileId) + (file.file_name ? '' : ext));
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
    },
    onDrawerPrint(id) {
      // Close the modern drawer and reopen the legacy info modal which
      // contains the existing print template (must remain unchanged).
      this.workflowDrawerOpen = false;
      this.$store.dispatch("ui/setModalActive", false);
      this.$nextTick(() => this.showInfoModal(id));
    },
    showAttachmentsModal(id) {
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      this.fetchDetailBill(id);
      this.setErrors(null);
      return (this.modalAtthacmentsActive = !this.modalAtthacmentsActive);
    },
    async showEditModal(id) {
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      await this.fetchDetailBill(id);
      // this.fetchAllBillTypes();
      // this.fetchAllCompanies();
      // if (this.bill != null) {
      //   this.getDepartmentByCompanyId(
      //     this.bill.created_by.department.company.id
      //   );
      //   this.getResponsiblePersonsByDepartmentId(
      //     this.bill.created_by.department.id
      //   );
      // }
      this.setErrors(null);
      return (this.modalEditActive = !this.modalEditActive);
    },
    addBillInputAction(e) {
      this.addBillInput(e);
    },
    updateBillInputAction(e) {
      this.updateBillInput(e);
    },
    loadContractsForSupplier(supplier) {
      this.loadingContracts = true;
      this.supplierContracts = [];
      this.selectedSupplierNoContract = !!supplier.no_contract_needed;
      if (supplier.no_contract_needed) {
        this.loadingContracts = false;
        this.newBill.contract = null;
        return;
      }
      ContractDataService.getBySupplier(supplier.id)
        .then((res) => {
          this.supplierContracts = res.data.data || [];
          // Auto-select the first (most recent) contract
          if (this.supplierContracts.length > 0) {
            this.newBill.contract = this.supplierContracts[0];
          }
          this.loadingContracts = false;
        })
        .catch(() => {
          this.supplierContracts = [];
          this.loadingContracts = false;
        });
    },

    onSubmitAdd() {
      const {
        // name,
        selectedType = document.querySelector('input[name="type"]:checked')
          .value,
        // ? null
        // : document.querySelector('input[name="type"]:checked').value,
        value,
        bill_no,
        suppliers,
        description,
        comment,
        departments,
      } = this.newBill;

      let fd = new FormData();
      fd.append("status", "1");
      fd.append("step", "1");
      // if (name != null) {
      //   fd.append("name", name);
      // }

      fd.append("type", selectedType);

      if (value != null) {
        fd.append("value", value);
      }
      if (bill_no != null) {
        fd.append("bill_no", bill_no);
      }
      if (suppliers != null) {
        fd.append("supplier", suppliers.id);
      }
      if (this.newBill.contract != null) {
        fd.append("contract_id", this.newBill.contract.id);
      }
      if (description != null) {
        fd.append("description", description);
      }
      if (comment != null) {
        fd.append("comment", comment);
      }
      if (departments.id != null) {
        fd.append("departments", departments.id);
      }

      if (this.$refs.filesInsert.files.length >= 1) {
        Array.from(this.$refs.filesInsert.files).forEach((f) => {
          fd.append("files[]", f);
        });
      }
      if (this.selectNotifyDay != null) {
        fd.append("notify_me", this.selectNotifyDay);
      }
      let user = JSON.parse(localStorage.getItem("user"));
      const vm = this; // Store a reference to the Vue component
      // Show the global busy overlay during the duplicate-check XHR. The
      // subsequent storeBill dispatch goes through axios, which will keep
      // the overlay on via the request interceptor.
      this.$store.dispatch("ui/setBusy", {
        busy: true,
        message: this.$t("common.saving") || "Saving…",
      });
      const clearBusy = () => this.$store.dispatch("ui/setBusy", false);
      const xhttp = new XMLHttpRequest();
      xhttp.onload = function () {
        var response = this.responseText;
        // Hand off to axios-driven storeBill which keeps the overlay on
        // through the actual create request; clear the overlay first so the
        // confirm() below is interactive.
        clearBusy();
        if (response == "1") {
          const response = confirm(
            "Fatura me numër të njejtë ekziston, a dëshironi të vazhdoni?"
          );
          if (response) {
            vm.storeBill(fd);
          }
        } else {
          vm.storeBill(fd);
        }
      };
      xhttp.onerror = clearBusy;
      xhttp.onabort = clearBusy;
      xhttp.open(
        "GET",
        process.env.VUE_APP_URL + "admin/get_exist_bills/" +
          bill_no +
          "/" +
          suppliers.id,
        true
      );
      xhttp.setRequestHeader("Authorization", "Bearer " + user.token);
      xhttp.send();
    },
    onSubmitRequest() {
      const {
        step,
        name,
        bill_type,
        name_of_billor,
        address,
        purpose_billor,
        company,
        deadline_from,
        deadline_to,
        responsible_person,
        total_price,
        unit_price,
        payment_date,
        payment_terms,
        billor_obligations,
        company_obligations,
        department,
        comment,
      } = this.newBill;

      let fd = new FormData();
      fd.append("status", "2");
      if (step != null) {
        fd.append("step", "2");
      }
      if (step === undefined) {
        fd.append("step", "2");
      }
      if (name != null) {
        fd.append("name", name);
      }
      if (bill_type != null) {
        fd.append("bill_type_id", bill_type.id);
      }
      if (name_of_billor != null) {
        fd.append("name_of_billor", name_of_billor);
      }
      if (address != null) {
        fd.append("address", address);
      }
      if (purpose_billor != null) {
        fd.append("purpose_billor", purpose_billor);
      }
      if (company != null) {
        fd.append("company_id", company.id);
      }
      if (deadline_from != null) {
        fd.append("deadline_from", deadline_from);
      }
      if (deadline_to != null) {
        fd.append("deadline_to", deadline_to);
      }
      if (department === undefined && this.user.roles !== undefined) {
        if (this.user.roles[0].name == "Procurement Officer") {
          fd.append("department_id", this.user.department_id);
        } else if (this.user.roles[0].name == "Director Department") {
          fd.append("department_id", this.user.department_id);
        }
      } else {
        fd.append("department_id", department.id);
      }
      if (responsible_person != null) {
        fd.append("responsible_person", responsible_person.id);
      }
      if (total_price != null) {
        fd.append("total_price", total_price);
      }
      if (unit_price != null) {
        fd.append("unit_price", unit_price);
      }
      if (payment_date != null) {
        fd.append("payment_date", payment_date);
      }
      if (payment_terms != null) {
        fd.append("payment_terms", payment_terms);
      }
      if (billor_obligations != null) {
        fd.append("billor_obligations", billor_obligations);
      }
      if (company_obligations != null) {
        fd.append("company_obligations", company_obligations);
      }
      if (department != null) {
        fd.append("department_id", department.id);
      }
      if (comment != null) {
        fd.append("comment", comment);
      }
      if (this.$refs.filesRequest.files.length >= 1) {
        Array.from(this.$refs.filesRequest.files).forEach((f) => {
          fd.append("files[]", f);
        });
      }

      this.requestBill(fd);
    },
    onSubmitEdit() {
      const {
        id,
        nameNew,
        // type,
        valueNew,
        bill_noNew,
        supplierNew,
        status,
        step,
        commentNew,
      } = this.bill;

      let fd = new FormData();
      fd.append("_method", "PUT");
      if (status != null) {
        if (status.id !== undefined) {
          fd.append("status", status.id);
        } else {
          fd.append("status", status);
        }
      }
      if (step !== null) {
        if (step.id !== undefined) {
          fd.append("step", step.id);
        } else {
          fd.append("step", step);
        }
      }
      if (id != null) {
        fd.append("id", id);
      }
      if (nameNew != null) {
        fd.append("name", nameNew);
      }
      // if (type != null) {
      //   fd.append("type_id", type.id);
      // }
      if (valueNew != null) {
        fd.append("value", valueNew);
      }
      if (bill_noNew != null) {
        fd.append("bill_no", bill_noNew);
      }
      if (supplierNew != null) {
        fd.append("supplier", supplierNew);
      }

      if (commentNew != null) {
        fd.append("comment", commentNew);
      }
      if (this.$refs.filesInsert.files.length >= 1) {
        Array.from(this.$refs.filesInsert.files).forEach((f) => {
          fd.append("files[]", f);
        });
      }

      this.updateBill(fd);
    },

    onSubmitSaveAttachments() {
      const { id, files_deleted_permanent } = this.bill;

      let fd = new FormData();
      fd.append("_method", "PUT");
      if (id != null) {
        fd.append("id", id);
      }
      Array.from(this.$refs.filesEdit.files).forEach((f) => {
        fd.append("files[]", f);
      });
      // if (files_deleted !== undefined) {
      //   fd.append("files_deleted", JSON.stringify(files_deleted));
      // }
      // if (files_restore !== undefined) {
      //   fd.append("files_restore", JSON.stringify(files_restore));
      // }
      if (files_deleted_permanent !== undefined) {
        fd.append(
          "files_deleted_permanent",
          JSON.stringify(files_deleted_permanent)
        );
      }

      this.updateBill(fd);
    },

    // showArchivedBills() {
    //   let tempPayload = {
    //     ...this.query,
    //     status: [{
    //       id: 3,
    //       name: "Archive",
    //     }],
    //   };

    //   this.fetchAllBills({ ...tempPayload, filterArchivedBills: true });
    //   // this.fetchAllBills({ ...this.query, filterArchivedBills: true });
    // },
    showInProgressBills() {
      this.fetchAllBills({ ...this.query, filterProgressBills: true });
    },
    showArchivedBills() {
      this.fetchAllBills({ ...this.query, filterArchivedBills: true });
    },

    showAllBillsss() {
      this.fetchAllBills(this.query);
    },
    async onDeleteFile(file) {
      const { isConfirmed } = await this.$swal.fire({
        input: "text",
        inputLabel: `Cancel file: ${file.file_name}`,
        cancelButtonText: this.$t('common.cancel'),
        confirmButtonText: this.$t('bills.removeFile'),
        confirmButtonColor: "#dc3545",
        showCancelButton: true,
      });
      if (isConfirmed) {
        this.RemoveFile({ id: file.id }).then(() => {
          this.fetchDetailBill(this.bill.id);
        });
      }
    },

    async onApprove(id, step) {
      const { value: modalValues, isConfirmed: isConfirmed } =
        await this.$swal.fire({
          cancelButtonText: this.$t('common.cancel'),
          confirmButtonText: this.$t('common.approve'),
          html: `
                    <label>Approve</label>
                    <textarea aria-label="Add a comment" class="swal2-textarea" placeholder="${this.$t('common.addComment')}" id="swal2-input" style="display: flex;"></textarea>
                    <input style="${
                      step == 6 ? "" : "display:none;"
                    }" type="file" id="approvalFile">
                    <p style="${
                      this.showRequiredMessageForComment
                        ? "color: salmon;"
                        : "color: salmon;display:none"
                    }">Comment is required</p>
                    <p style="${
                      this.showRequiredMessageForFile
                        ? "color: salmon;"
                        : "color: salmon;display:none"
                    }">File is required</p>
                `,
          preConfirm: () => [
            document.getElementById("swal2-input").value,
            document.getElementById("approvalFile").value,
          ],
          showCancelButton: true,
        });
      if (isConfirmed) {
        if (modalValues[0]) {
          if (step == 6 && !modalValues[1]) {
            this.showRequiredMessageForFile = true;
          }
          this.approveBill({
            id: id,
            comment: modalValues[0],
            file: modalValues[1],
          });
        } else {
          if (step == 6 && !modalValues[1]) {
            this.showRequiredMessageForFile = true;
          }
          this.showRequiredMessageForComment = true;
          this.onApprove(id, step);
        }
      }
    },
    async onCancel(id) {
      const { value: comment, isConfirmed: isConfirmed } =
        await this.$swal.fire({
          input: "textarea",
          inputLabel: "Cancel",
          cancelButtonText: this.$t('common.cancel'),
          confirmButtonText: this.$t('bills.cancelBill'),
          confirmButtonColor: "#dc3545",
          inputPlaceholder: this.$t('common.addComment'),
          inputAttributes: {
            "aria-label": "Add a comment",
          },
          showCancelButton: true,
        });
      if (isConfirmed) {
        if (comment) {
          this.cancelBill({ id: id, comment: comment });
        } else {
          this.cancelBill({ id: id });
        }
      }
    },

    onFileInsert() {
      let files = this.$refs.filesInsert.files;
      this.changeFileLabels(files, "labelFilesNameInsert");
    },

    openCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(this.$t('bills.form.cameraNotAvailable'));
        return;
      }
      this.showCamera = true;
      this.capturedImage = null;
      this.$nextTick(() => {
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        }).then((stream) => {
          this.cameraStream = stream;
          if (this.$refs.cameraVideo) {
            this.$refs.cameraVideo.srcObject = stream;
          }
        }).catch(() => {
          alert(this.$t('bills.form.cameraNotAvailable'));
          this.showCamera = false;
        });
      });
    },
    capturePhoto() {
      const video = this.$refs.cameraVideo;
      const canvas = this.$refs.cameraCanvas;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      this.capturedImage = canvas.toDataURL('image/jpeg', 0.85);
    },
    retakePhoto() {
      this.capturedImage = null;
    },
    usePhoto() {
      const canvas = this.$refs.cameraCanvas;
      canvas.toBlob((blob) => {
        const file = new File([blob], 'invoice_' + Date.now() + '.jpg', { type: 'image/jpeg' });
        const dt = new DataTransfer();
        // Keep existing files
        if (this.$refs.filesInsert.files) {
          Array.from(this.$refs.filesInsert.files).forEach(f => dt.items.add(f));
        }
        dt.items.add(file);
        this.$refs.filesInsert.files = dt.files;
        this.onFileInsert();
        this.closeCamera();
      }, 'image/jpeg', 0.85);
    },
    closeCamera() {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop());
        this.cameraStream = null;
      }
      this.showCamera = false;
      this.capturedImage = null;
    },

    onFileRequest() {
      let files = this.$refs.filesRequest.files;
      this.changeFileLabels(files, "labelFilesNameRequest");
    },
    onFileChange() {
      let files = this.$refs.filesEdit.files;
      this.changeFileLabels(files, "labelFilesName");
    },
    changeFileLabels(files, label) {
      this.label = null;
      Array.from(files).forEach((f) => {
        if (this.label === null) {
          this.label = f.name;
        } else {
          this.label = this.label + ", " + f.name;
        }
      });
      this[label] = this.label;
    },
    showDeleteModal(id) {
      this.$swal
        .fire({
          text: this.$t('bills.deleteConfirm'),
          icon: "error",
          cancelButtonText: this.$t('common.cancel'),
          confirmButtonText: this.$t('common.yes'),
          showCancelButton: true,
        })
        .then((result) => {
          if (result["isConfirmed"]) {
            this.deleteBill(id);
            // this.fetchAllTasks();
            this.fetchAllBills(this.query);
            this.$swal.fire({
              text: this.$t('bills.deleteSuccess'),
              icon: "success",
              timer: 10000,
            });
          }
        });
    },
    getResults() {
      this.fetchAllBills(this.query);
    },
    getRouteQuery() {
      if (this.$route.query.page != null) {
        this.query.page = parseInt(this.$route.query.page);
      }
      return this.query;
    },
    getStatusId() {
      if (this.$route.query.status != null) {
        this.query.search.status.id = this.$route.query.status;
      }

      return this.query;
    },
    modalContent() {},
    checkIfFieldHasErrors(errors, field, loader) {
      if (errors != null && !loader) {
        if (errors[field] != null) {
          return true;
        }
      }
      return false;
    },
    checkBillStatus(status) {
      if (status == 1) {
        return "REQUESTED";
      } else if (status == 2) {
        return "PENDING";
      } else if (status == 3) {
        return "APPROVED FROM CEO";
      } else if (status == 4) {
        return "CANCELED";
      } else if (status == 5) {
        return "APPROVED FROM ADMIN";
      } else if (status == 6) {
        return "Printed & Closed";
      } else if (status == 7) {
        return "Delivered to Finances";
      }
    },

    billStepLabel(label) {
      if (!label) return '';
      if (label === 'approved_waiting_print') return this.$t('bills.info.approvedWaitingPrint');
      if (label === 'printed_closed') return this.$t('bills.info.printedClosed');
      if (label === 'delivered_to_finances') return this.$t('bills.info.deliveredToFinances');
      // Raw role name (legacy / no workflow)
      return label;
    },
    getStatusStyle(status) {
      switch (status) {
        case 1:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "#17a2b8",
            padding: "2px 5px",
            "font-size": "15px",
          };
        case 2:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "#f7cd80",
            padding: "2px 5px",
            "font-size": "15px",
          };
        case 3:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "green",
            padding: "2px 5px",
            "font-size": "15px",
          };
        case 4:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "red",
            padding: "2px 5px",
            "font-size": "15px",
          };
        case 5:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "#20c997",
            padding: "2px 5px",
            "font-size": "15px",
          };
        case 6:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "#28a745",
            padding: "2px 5px",
            "font-size": "15px",
          };
        case 7:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "#6f42c1",
            padding: "2px 5px",
            "font-size": "15px",
          };
        default:
          return {
            "border-radius": "5px",
            color: "#fff",
            "font-weight": "700",
            background: "grey",
            padding: "2px 5px",
            "font-size": "15px",
          };
      }
    },

    firstAndLastname({ first_name, last_name }) {
      if (first_name !== null && last_name !== null) {
        return `${first_name} ${last_name}`;
      } else {
        // alert("no firstname");
        return "";
      }
    },
    getBillAttachment(file) {
      return this.getBillAttachments(file);
    },
    showAttachmentIcon(file_extension) {
      if (file_extension == "docx") {
        return "fa-file-word";
      } else if (file_extension == "doc") {
        return "fa-file-word";
      } else if (file_extension == "pdf") {
        return "fa-file-pdf";
      } else if (file_extension == "xlsx") {
        return "fa-file-excel";
      } else if (file_extension == "xls") {
        return "fa-file-excel";
      } else {
        return "";
      }
    },
    checkIfUserHasPermissionToShowAll() {
      let permission = "Bill Show All";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canShowAll = true);
      }
      if (p2.length >= 1) {
        return (this.canShowAll = true);
      }

      return (this.canShowAll = false);
    },
    checkIfUserHasPermissionToShow() {
      let permission = "Bill Show";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canShow = true);
      }
      if (p2.length >= 1) {
        return (this.canShow = true);
      }

      return (this.canShow = false);
    },
    checkIfUserHasPermissionToAdd() {
      let permission = "Bill Add";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canAdd = true);
      }
      if (p2.length >= 1) {
        return (this.canAdd = true);
      }

      return (this.canAdd = false);
    },
    checkIfUserHasPermissionToRequest() {
      let permission = "Bill Request";
      let currentRolePermissions = this.rolePermissions.filter(
        (p) => p.name === permission
      );
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (currentRolePermissions.length >= 1) {
        return (this.canRequest = true);
      }
      if (p2.length >= 1) {
        return (this.canRequest = true);
      }

      return (this.canRequest = false);
    },
    checkIfUserHasPermissionToEdit() {
      let permission = BILL_PERMISSIONS.BILL_EDIT;
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canEdit = true);
      }
      if (p2.length >= 1) {
        return (this.canEdit = true);
      }

      return (this.canEdit = false);
    },
    checkIfUserHasPermissionToDelete() {
      let permission = "Bill Delete";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canDelete = true);
      }
      if (p2.length >= 1) {
        return (this.canDelete = true);
      }

      return (this.canDelete = false);
    },
    checkIfUserHasPermissionToApprove() {
      let permission = "Bill Approve";

      // let permission = BILL_PERMISSIONS.BILL_APPROVE;
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);

      if (p1.length >= 1) {
        return (this.canApprove = true);
      }
      if (p2.length >= 1) {
        return (this.canApprove = true);
      }

      return (this.canApprove = false);
    },
    checkIfUserHasPermissionToAiVerify() {
      const permission = "Bill Verify AI";
      const p1 = this.rolePermissions.filter((p) => p.name === permission);
      const p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1 || p2.length >= 1) {
        return (this.canAiVerify = true);
      }
      return (this.canAiVerify = false);
    },
    checkIfUserHasPermissionToGenerateReport() {
      const roleName = this.user.roles[0].name;
      if (roleName === 'Procurement Officer' || roleName === 'Super Admin') {
        return (this.canGenerateReport = true);
      }
      return (this.canGenerateReport = false);
    },
    checkIfUserHasPermissionToPrint() {
      const roleName = this.user.roles[0].name;
      const deptName = this.user.department ? this.user.department.name : '';
      if (roleName === 'Procurement Officer') {
        return (this.canPrintAll = true);
      }
      if (roleName === 'Director Department' && deptName === 'Prokurimi') {
        return (this.canPrintAll = true);
      }
      return (this.canPrintAll = false);
    },
    checkIfUserHasPermissionToBillAttachments() {
      let permission = "Bill Attachments";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canBillAttachments = true);
      }
      if (p2.length >= 1) {
        return (this.canBillAttachments = true);
      }

      return (this.canBillAttachments = false);
    },
    checkIfUserHasPermissionToShowSuppliers() {
      let permission = "Supplier Show";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1 || p2.length >= 1) {
        return (this.canShowSuppliers = true);
      }
      return (this.canShowSuppliers = false);
    },
    checkIfUserHasPermissionToAddSupplier() {
      let permission = "Supplier Add";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1 || p2.length >= 1) {
        return (this.canAddSupplier = true);
      }
      return (this.canAddSupplier = false);
    },
    openAddSupplierModal() {
      this.$router.push({ path: '/platform/suppliers', query: { openAdd: 'true' } });
    },

    clear() {
      this.$refs.filesInsert.value = "";
      this.labelFilesNameInsert = "Choose a file";
    },
    // canPrintAll(){
    //   if( this.user.roles[0].name == "Director Department" &&
    //   this.user.department.name == "Prokurimi"){
    //     return true;
    //   }
    //   return false;
    // },
    canApproveUser(status, assigned_dep_id, canApprove) {
      // If the backend has already computed authorisation, honour it
      if (canApprove !== undefined && canApprove !== null) {
        return canApprove;
      }

      // Legacy fallback (used when can_approve is not yet in the response)
      if (status !== 1 && status !== 2) {
        return false;
      }
      if (!this.canApprove) {
        return false;
      }
      if (this.user.roles[0].name == "Super Admin") {
        return true;
      }
      if (this.user.roles[0].name == "Executive Director") {
        return true;
      }
      if (this.user.department && this.user.department.id == assigned_dep_id) {
        return true;
      }
      return false;
    },

    PDF() {
      const bills = this.billsPaginatedData.data;

      // Open a new window for the PDF
      const WinPrint = window.open();

      // Iterate through each bill and generate the content for the PDF
      for (const [index, bill] of bills.entries()) {
        const printContents = this.generatePrintContent(bill, index);

        // Execute the code for each bill
        const { id, status, step } = bill;
        let fd = new FormData();
        fd.append("_method", "PUT");
        if (status != null) {
          if (status.id !== undefined) {
            fd.append("status", 6);
          } else {
            fd.append("status", 6);
          }
        }
        if (step !== null) {
          if (step.id !== undefined) {
            fd.append("step", step.id);
          } else {
            fd.append("step", step);
          }
        }
        if (id != null) {
          fd.append("id", id);
        }
        this.updateBill(fd);

        // Write the content for the current bill
        WinPrint.document.write(`<!DOCTYPE html>
          <html>
            <head>
              <title>Bill PDF</title>
            </head>
            <body>
              ${printContents}
            </body>
          </html>`);

        // Add a page break between bills, except for the last one
        if (index < bills.length - 1) {
          WinPrint.document.write(
            '<div style="page-break-before: always;"></div>'
          );
        }
      }

      // Close the document and print
      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();
    },

    generatePrintContent(bill, index) {
      console.log("Bill object:", bill);
      const commentsHtml = bill.comments
        ? `<tr style="height: auto; border: 1px solid black;">
          <td>Komentet:</td>
          <td v-if="bill.comments.length >= 1" style="max-width: 400px">
            ${bill.comments
              .map(
                (comment) => `<div class="mb-1">
                  <span v-if="${
                    comment.steps !== null
                  }" class="badge badge-warning">Step ${comment.steps}</span>
                  <p class="mb-0">${comment.name}</p>
                  -<small>${comment.user_id}</small>
                </div>`
              )
              .join("")}
          </td>
        </tr>`
        : "";

      const documentsHtml = bill.files
        ? `
        <tr style="border: 1px solid black;">
          <td>Dokumentet e bashkangjitura:</td>
          <td>
            ${bill.files
              .map(
                (file) => `<div key="${file.id}">
                  <a href="#" @click="getBillAttachment(${JSON.stringify(
                    file
                  )})" class="btn-link text-secondary">
                    <i class="far fa-fw ${this.showAttachmentIcon(
                      file.file_extension
                    )}"></i>${file.file_name}
                  </a>
                </div>`
              )
              .join("")}
          </td>
        </tr>`
        : "";

      const prtHtml = `
      <div id="printTable${index}">
      <table
        v-if="!isLoading && billsPaginatedData"
        id="printTable"
        class="table table-hover table-borderless table-striped p-0"
      >
        <div class="" style="width: 100%;">
        <img style="width: 50%;" src="../../../public/img/Picture3.svg" >
        </div>
        <h3 style="text-align: center;"> FORMULARI I APROVIMIT TË FATURAVE </h3>
        <thead>
          <tr>
            <th>Emërtimi</th>
            <th>Përshkrimi</th>
          </tr>
        </thead>

        <tbody>
          <tr style="border: 1px solid black;">
            <td style="width: 45%">Id:</td>
            <td style="width: 50%">${bill.id}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Furnitori:</td>
            <td>${bill.supplier}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Numri i faturës:</td>
            <td>${bill.bill_no}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Lloji:</td>
            <td>${bill.type}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Vlera:</td>
            <td>${bill.value}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Përshrkimi:</td>
            <td>${bill.description || ""}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Për Departamentin:</td>
            <td>${bill.assigned_dep_id}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Pranoi nga departamenti</td>
            <td>${
              bill.updated_by && bill.updated_by.first_name
                ? bill.updated_by.first_name
                : ""
            } ${
        bill.updated_by && bill.updated_by.last_name
          ? bill.updated_by.last_name
          : ""
      }</td>
            </tr>
          <tr style="border: 1px solid black;">
          <td>Komenti:</td>
          <td>${bill.name || ""}</td>
        </tr>
          <tr style="border: 1px solid black;">
            <td>Krijuar nga:</td>
            <td>${bill.created_by.first_name} ${bill.created_by.last_name}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Step:</td>
            <td v-if="bill.step">
              <span class="badge badge-warning">Step ${bill.step}</span>
            </td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Status:</td>
            <td>
              <span class="badge badge-info">${this.checkBillStatus(
                bill.status
              )}</span>
            </td>
          </tr>
          ${commentsHtml}
          ${documentsHtml}
          <tr style="border: 1px solid black;">
            <td>Së fundmi modifikuar më:</td>
            <td>${new Date(bill.updated_at).toLocaleString()}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Krijuar më:</td>
            <td>${new Date(bill.created_at).toLocaleString()}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Aprovuar herën e parë më:</td>
            <td>${new Date(bill.approved_first).toLocaleString() || ""}</td>
          </tr>
          <tr style="border: 1px solid black;">
            <td>Aprovuar herën e dytë më:</td>
            <td>${new Date(bill.approved_second).toLocaleString()|| ""}</td>
          </tr>
        </tbody>
      </table>
    </div>`;

      let stylesHtml = "";
      for (const node of [
        ...document.querySelectorAll('link[rel="stylesheet"], style'),
      ]) {
        stylesHtml += node.outerHTML;
      }

      return `
        ${stylesHtml}
        ${prtHtml}
      `;
    },

    isEligibleForReport(bill) {
      // Eligible for procesverbal: Pending (2), Approved CEO (3), Approved Admin (5), Printed & Closed (6)
      // NOT 7 (Delivered to Finances) — those are already done
      return bill.status == 2 || bill.status == 3 || bill.status == 5 || bill.status == 6;
    },
    toggleBillSelection(billId) {
      const idx = this.selectedBillIds.indexOf(billId);
      if (idx === -1) {
        this.selectedBillIds.push(billId);
      } else {
        this.selectedBillIds.splice(idx, 1);
      }
    },
    isBillSelected(billId) {
      return this.selectedBillIds.includes(billId);
    },
    selectAllEligibleBills() {
      const eligibleIds = (this.billList || [])
        .filter(b => this.isEligibleForReport(b))
        .map(b => b.id);
      const allSelected = eligibleIds.every(id => this.selectedBillIds.includes(id));
      if (allSelected) {
        this.selectedBillIds = this.selectedBillIds.filter(id => !eligibleIds.includes(id));
      } else {
        eligibleIds.forEach(id => {
          if (!this.selectedBillIds.includes(id)) this.selectedBillIds.push(id);
        });
      }
    },
    allEligibleSelected() {
      const eligibleIds = (this.billList || [])
        .filter(b => this.isEligibleForReport(b))
        .map(b => b.id);
      return eligibleIds.length > 0 && eligibleIds.every(id => this.selectedBillIds.includes(id));
    },
    async generateProcessVerbal() {
      if (this.selectedBillIds.length === 0) return;

      // Warn the user that bills will be marked Printed & Closed regardless of print action
      const confirm = await this.$swal.fire({
        title: this.$t('bills.procesverbalConfirmTitle'),
        html: this.$t('bills.procesverbalConfirmBody', { count: this.selectedBillIds.length }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e6a817',
        cancelButtonColor: '#6c757d',
        confirmButtonText: this.$t('common.yes'),
        cancelButtonText: this.$t('common.no'),
      });
      if (!confirm.isConfirmed) return;

      this.isGeneratingReport = true;
      try {
        const res = await BillDataService.generateReport(this.selectedBillIds, this.$i18n.locale);
        // Open PDF in a new tab for immediate printing
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
          win.addEventListener('load', () => {
            win.focus();
            win.print();
          });
        }
        // Clear selection and refresh list
        this.selectedBillIds = [];
        this.fetchAllBills(this.query);
        this.$swal.fire({
          text: this.$t('bills.reportGenerated'),
          icon: 'success',
          timer: 4000,
        });
      } catch (err) {
        const msg = err.response?.data?.message || this.$t('bills.reportError');
        this.$swal.fire({ text: msg, icon: 'error' });
      } finally {
        this.isGeneratingReport = false;
      }
    },
    printData() {
      const { id, step } = this.bill;

      // Mark the bill as Printed & Closed (status=6)
      let fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("id", id);
      fd.append("status", 6);
      fd.append("step", step);
      this.updateBill(fd).then(() => {
        // Refresh so buttons update immediately
        this.fetchDetailBill(id);
        this.fetchAllBills(this.query);
      });

      // Open print window
      const prtHtml = document.getElementById("printTable").outerHTML;
      let stylesHtml = "";
      for (const node of [
        ...document.querySelectorAll('link[rel="stylesheet"], style'),
      ]) {
        stylesHtml += node.outerHTML;
      }
      const WinPrint = window.open();

      WinPrint.document.write(`<!DOCTYPE html>
            <html>
            
              <head>
              <title>Bill PDF</title>
                ${stylesHtml}
              </head>
              <body>
                ${prtHtml}
              </body>
            </html>`);

      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();
    },

    showSearch() {
      this.search = !this.search;
      this.fetchAllBills();
      if (this.canShowSuppliers) this.fetchAllSuppliers();
    },

    async onSubmitSearch() {
      this.query.page = 1;
      // this.query.status = 7;
      await this.fetchAllBills(this.query);
    },

    // giveAccessTo(accessRoles) {
    //   return canGivenRolesHaveAccess(accessRoles, this.user.roles);
    // },
  },
  watch: {
    '$route.query.status': function (newStatus) {
      if (this.canShowAll) {
        this.query.search.status.id = newStatus != null ? newStatus : 0;
        this.fetchAllBills(this.query);
      }
    },
    updatedData: function () {
      if (this.updatedData !== null && !this.isUpdating) {
        this.$store.dispatch("ui/setModalActive", false);
        this.$swal.fire({
          text: this.$t('bills.updateSuccess'),
          icon: "success",
          timer: 10000,
        });

        this.fetchAllBills(this.query);
        this.labelFilesName = "Choose a file";
        this.modalEditActive = false;
        return (this.modalAtthacmentsActive = false);
      }
    },
    createdData: function () {
      if (this.createdData !== null && !this.isCreating) {
        this.$store.dispatch("ui/setModalActive", false);
        this.$swal.fire({
          text: this.$t('bills.addSuccess'),
          icon: "success",
          timer: 10000,
        });

        this.fetchAllBills(this.query);
        this.modalAddActive = false;
        return (this.modalRequestActive = false);
      }
    },
    billApprove: function () {
      if (this.billApprove == "success") {
        this.$swal.fire({
          text: this.$t('bills.requestApproved'),
          icon: "success",
          timer: 10000,
        });
        this.fetchAllBills(this.query);
        this.modalInfoActive = false;
      }
      if (this.billApprove == "error") {
        this.$swal.fire({
          text: this.$t('bills.requestNotApproved'),
          icon: "error",
          timer: 10000,
        });
      }
      this.resetBillApprove();
    },
    billCancel: function () {
      if (this.billCancel == "success") {
        this.$swal.fire({
          text: this.$t('bills.requestCanceled'),
          icon: "success",
          timer: 10000,
        });
        this.fetchAllBills(this.query);
        this.modalInfoActive = false;
      }
      if (this.billCancel == "error") {
        this.$swal.fire({
          text: this.$t('bills.requestNotCanceled'),
          icon: "error",
          timer: 10000,
        });
      }
      this.resetBillCancel();
    },
    billsPaginatedData: function () {
      let params = this.$route.query;

      // console.log(this.$store.state.bills.billsPaginatedData.data);
      // if (params.status == 1) {
      //   const con = this.billsPaginatedData.data.filter(
      //     ({ status }) => status === 1
      //   );
      //   this.$store.state.bills.billsPaginatedData.data = con;
      // }

      // if (params.status == 2) {
      //   this.$store.state.bills.billsPaginatedData.data =
      //     this.billsPaginatedData.data;
      // }

      if (params.status == 1) {
        const con = this.billsPaginatedData.data;
        this.$store.state.bills.billsPaginatedData.data = con;
      }
      // if (params.status == 3) {
      //   const con = this.billsPaginatedData.data;
      //   this.$store.state.bills.billsPaginatedData.data = con;
      // }
      // if (params.status == 1) {
      //   const con = this.billsPaginatedData.data.filter(
      //     ({ status }) => status === 1
      //   );
      //   this.$store.state.bills.billsPaginatedData.data = con.filter(
      //     ({ deadline_to }) => new Date(deadline_to) > new Date()
      //   );
      // }
      // if (params.status == 6) {
      //   var date = new Date(); // Now
      //   date.setDate(date.getDate() + 30);
      //   const con = this.billsPaginatedData.data.filter(
      //     ({ deadline_to }) => new Date(deadline_to) > new Date()
      //   );
      //   this.$store.state.bills.billsPaginatedData.data = con.filter(
      //     ({ deadline_to }) => new Date(deadline_to) < date
      //   );
      // }
      if (params.status == 7) {
        // Delivered to Finances filter — no client-side date filtering needed
        const con = this.billsPaginatedData.data;
        this.$store.state.bills.billsPaginatedData.data = con;
      }
    },
  },
  created() {
    this.checkIfUserHasPermissionToShowAll();
    this.checkIfUserHasPermissionToShow();
    this.checkIfUserHasPermissionToAdd();
    this.checkIfUserHasPermissionToRequest();
    this.checkIfUserHasPermissionToEdit();
    this.checkIfUserHasPermissionToDelete();
    this.checkIfUserHasPermissionToApprove();
    this.checkIfUserHasPermissionToAiVerify();
    this.checkIfUserHasPermissionToPrint();
    this.checkIfUserHasPermissionToGenerateReport();
    this.checkIfUserHasPermissionToBillAttachments();
    this.checkIfUserHasPermissionToShowSuppliers();
    this.checkIfUserHasPermissionToAddSupplier();
    if (this.canShowAll) {
      this.getStatusId();
      this.fetchAllBills(this.getRouteQuery());
    }
  },
};
