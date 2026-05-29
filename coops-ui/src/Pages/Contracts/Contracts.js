import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from "@/Components/vue-multiselect/src";
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import CurrencyInput from '../../Components/CurrencyInput/CurrencyInput.vue'
import {
    CONTRACT_LIST_GETTER,
    CONTRACTS_PAGINATED_DATA_GETTER,
    CONTRACT_GETTER,
    NEW_CONTRACT_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    IS_CREATING_GETTER,
    CREATED_DATA_GETTER,
    IS_UPDATING_GETTER,
    UPDATED_DATA_GETTER,
    ERRORS_GETTER,
    FETCH_ALL_CONTRACTS_ACTION,
    FETCH_DETAIL_CONTRACT_ACTION,
    STORE_CONTRACT_ACTION,
    UPDATE_CONTRACT_ACTION,
    DELETE_CONTRACT_ACTION,
    ADD_CONTRACT_INPUT_ACTION,
    UPDATE_CONTRACT_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/Contract/constants';
import {CONTRACT_TYPE_LIST_GETTER, FETCH_ALL_CONTRACT_TYPES_ACTION} from "../../Store/Modules/ContractType/constants";
import {COMPANY_LIST_GETTER, FETCH_ALL_COMPANIES_ACTION} from "../../Store/Modules/Company/constants";
import {FETCH_ALL_USERS_ACTION, USER_LIST_GETTER} from "../../Store/Modules/User/constants";
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {useMeta} from "vue-meta";
import {RESPONSIBLE_PERSON_LIST_GETTER} from "../../Store/Modules/ResponsiblePerson/constants";
import {PERMISSIONS} from "../../Constants/permissions";
import {
    PROCUREMENT_OFFICER_LIST_GETTER
} from "../../Store/Modules/ProcurementOfficer/constants";
import {canGivenRolesHaveAccess} from "../../Roles/role.logic";
import {ROLES} from "../../Roles/roles";
import {SUPPLIER_LIST_GETTER, FETCH_ALL_SUPPLIERS_ACTION} from "../../Store/Modules/Supplier/constants";
import ContractTemplateDataService from "../../Services/ContractTemplateDataService";
import ContractWorkflowDrawer from "../../Components/ContractWorkflow/ContractWorkflowDrawer.vue";
import ContractCard from "../../Components/ContractWorkflow/ContractCard.vue";

export default {
    name: "Contracts",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
        flatPickr,
        "app-currency-input": CurrencyInput,
        "contract-workflow-drawer": ContractWorkflowDrawer,
        "contract-card": ContractCard,
    },
    
    setup() {
        useMeta({title: 'Contracts'})
    },
    data() {
        return {
            showRequiredMessageForComment: false,
            showRequiredMessageForFile: false,
            approvalComment: '',
            approvalFile: null,
            modalAddActive: false,
            modalInfoActive: false,
            modalEditActive: false,
            modalAtthacmentsActive: false,
            modalRequestActive: false,
            query: {
                page: 1,
                search: {
                    status: {id: 6, name: "ALL"},
                    sort: 'DESC',
                    orderBy: {id: 'id', name: 'Id'},
                    text: null,
                    start_date: null,
                    end_date: null,
                    company: null,
                    department: null,
                    procurement_officer: null,
                    responsible_person: null,
                    contract_type: null
                }
            },
            selectNotifyDay: null,
            editNotifyDay: null,
            search: false,
            daysList: [ '15', '30', '45', '60', '90', '120', '160', '180' ],
            statusList: [
                {name: "ARCHIVE", id: 1},
                {name: "REQUEST", id: 2},
                {name: "IN PROGRESS", id: 3},
                {name: "CANCELED", id: 4},
                {name: "APPROVED", id: 5},
            ],
            stepList: [
                {name: "Step 1", id: 1},
                {name: "Step 2", id: 2},
                {name: "Step 3", id: 3},
                {name: "Step 4", id: 4},
                {name: "Step 5", id: 5},
                {name: "Step 6", id: 6},
            ],
            searchStatusList: [
                {name: "ALL", id: 6},
                {name: "ARCHIVE", id: 1},
                {name: "REQUEST", id: 2},
                {name: "IN PROGRESS", id: 3},
                {name: "CANCELED", id: 4},
                {name: "APPROVED", id: 5},
            ],
            sortList: ['ASC', 'DESC'],
            orderByList: [
                {id: 'id', name: 'Id'},
                {id: 'serial_number', name: 'Serial Number'},
                {id: 'name', name: 'Name'},
                {id: 'name_of_contractor', name: 'Name of Contractor'},
                {id: 'address', name: 'Address'},
                {id: 'purpose_contractor', name: 'Purpose of Contractor'},
                {id: 'deadline_from', name: 'Start date'},
                {id: 'deadline_to', name: 'End date'},
                {id: 'responsible_person', name: 'Responsible person'},
                {id: 'total_price', name: 'Total price'},
                {id: 'unit_price', name: 'Unit price'},
                {id: 'payment_date', name: 'Payment date'},
                {id: 'contractor_obligations', name: 'Contractor obligations'},
                {id: 'company_obligations', name: 'Company obligations'},
                {id: 'company_obligations', name: 'Company obligations'},
            ],
            today: new Date(),
            config: {
                wrap: true,
                altFormat: 'M j, Y',
                altInput: true,
                dateFormat: 'Y-m-d',
            },
            priceConfig: {
                currency: 'EUR',
                valueRange: {min: 1, max: 1000000000},
                hideCurrencySymbolOnFocus: false
            },
            canShowAll: false,
            canShow: false,
            canAdd: false,
            canRequest: false,
            canEdit: false,
            canDelete: false,
            canApprove: false,
            canContractAttachments: false,
            canShowSuppliers: false,
            canAddSupplier: false,
            labelFilesNameInsert: "Choose a file",
            labelFilesName: "Choose a file",
            labelFilesNameRequest: "Choose a file",
            clicked: false,
            allRoles: ROLES,
            contractsEdited: [],
            cE: false,
            showInlineSupplierForm: false,
            inlineSupplier: { name: '', bussines_no: '', address: '', phone: '', email: '' },
            isCreatingSupplier: false,
            // Template integration
            templateList: [],
            selectedTemplate: null,
            filledTemplateContent: null,
            isFillingTemplate: false,
            useTemplate: false,
            // Workflow drawer
            workflowDrawerOpen: false,
            workflowDrawerBusy: false,
            workflowTimeline: [],
            workflowTimelineLoading: false,
            // List view mode: 'cards' | 'kanban' | 'table'
            viewMode: (() => {
                const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('contracts.viewMode')) || 'cards';
                if (saved === 'table' && typeof window !== 'undefined' && window.innerWidth < 768) return 'cards';
                return saved;
            })(),
        }
    },
    computed: {
        ...mapGetters('contracts', {
            contract: CONTRACT_GETTER,
            newContract: NEW_CONTRACT_GETTER,
            contractList: CONTRACT_LIST_GETTER,
            contractsPaginatedData: CONTRACTS_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            contractApprove: "contractApprove",
            contractCancel: "contractCancel",
        }),

        ...mapGetters('contract_types', {
            contract_typeList: CONTRACT_TYPE_LIST_GETTER,
        }),

        filteredContractTypeList() {
            if (this.newContract && this.newContract.company && this.newContract.company.id) {
                return this.contract_typeList.filter(ct => ct.company_id === this.newContract.company.id);
            }
            return this.contract_typeList;
        },

        filteredEditContractTypeList() {
            if (this.contract && this.contract.company && this.contract.company.id) {
                return this.contract_typeList.filter(ct => ct.company_id === this.contract.company.id);
            }
            return this.contract_typeList;
        },

        ...mapGetters('companies', {
            companyList: COMPANY_LIST_GETTER,
        }),

        ...mapGetters('users', {
            userList: USER_LIST_GETTER,
        }),

        ...mapGetters('departments', {
            departmentList: DEPARTMENT_LIST_GETTER,
        }),

        ...mapGetters('responsible_person', {
            responsible_personList: RESPONSIBLE_PERSON_LIST_GETTER,
        }),

        ...mapGetters('procurement_officer', {
            procurement_officerList: PROCUREMENT_OFFICER_LIST_GETTER,
        }),

        ...mapGetters('suppliers', {
            supplierList: SUPPLIER_LIST_GETTER,
        }),

        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },

        kanbanColumns() {
            const items = (this.contractsPaginatedData && this.contractsPaginatedData.data) || [];
            const cols = [
                { id: 2, key: 'request',  label: 'Request',     icon: 'fa-paper-plane',  items: [] },
                { id: 3, key: 'progress', label: 'In Progress', icon: 'fa-spinner',      items: [] },
                { id: 5, key: 'approved', label: 'Approved',    icon: 'fa-check-circle', items: [] },
                { id: 4, key: 'canceled', label: 'Canceled',    icon: 'fa-ban',          items: [] },
                { id: 1, key: 'archived', label: 'Archived',    icon: 'fa-archive',      items: [] },
            ];
            const byId = {};
            cols.forEach(c => { byId[c.id] = c; });
            items.forEach(it => {
                const target = byId[it.status] || byId[2];
                target.items.push(it);
            });
            return cols;
        },

        selectStep: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['step'] != null) {
                        return this.newContract.step;
                    }
                }
                return null;
            },
            set: function (step) {
                this.addStepForContractAction(step);
            }
        },
        selectContractType: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['contract_type'] != null) {
                        return this.newContract.contract_type;
                    }
                }
                return null;
            },
            set: function (contract_type) {
                this.addContractTypeForContractAction(contract_type);
            }
        },
        selectSupplier: {
            get: function () {
                if (this.newContract != null && this.newContract['supplier'] != null) {
                    return this.newContract.supplier;
                }
                return null;
            },
            set: function (supplier) {
                this.addSupplierForContractAction(supplier);
                if (supplier && supplier.address) {
                    this.newContract.address = supplier.address;
                }
            }
        },
        selectCompany: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['company'] != null) {
                        return this.newContract.company;
                    }
                }
                return null;
            },
            set: function (company) {
                if (company != null) {
                    this.addCompanyForContractAction(company);
                    this.getDepartmentByCompanyId(company.id)
                }
                this.setDepartmentForCompanyNullAction()
            }
        },
        deadline_from: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['deadline_from'] != null) {
                        return this.newContract.deadline_from;
                    }
                }
                return null;
            },
            set: function (deadline_from) {
                this.addDeadlineFromForContractAction(deadline_from);
            }
        },
        deadline_to: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['deadline_to'] != null) {
                        return this.newContract.deadline_to;
                    }
                }
                return null;
            },
            set: function (deadline_to) {
                this.addDeadlineToForContractAction(deadline_to);
            }
        },
        selectDepartment: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['department'] != null) {
                        return this.newContract.department;
                    }
                }
                return null;
            },
            set: function (department) {
                if (department != null) {
                    this.addDepartmentForContractAction(department);
                    this.getResponsiblePersonsByDepartmentId(department.id)
                    this.addResponsiblePersonForContractAction(null)
                }
            }
        },
        selectResponsiblePerson: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['responsible_person'] != null) {
                        return this.newContract.responsible_person;
                    }
                }
                // console.log('1');
                return null;
            },
            set: function (responsible_person) {
                // console.log('2');
                this.addResponsiblePersonForContractAction(responsible_person);
            }
        },
        selectTotalPrice: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['total_price'] != null || this.newContract['total_price'] != undefined) {
                        return this.newContract.total_price
                    }
                }
            },
            set: function (value) {
                this.addTotalPriceForContractAction(value)
            }
        },
        selectUnitPrice: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['unit_price'] != null) {
                        return this.newContract.unit_price
                    }
                }
            },
            set: function (value) {
                this.addUnitPriceForContractAction(value)
            }
        },
        selectPaymentDate: {
            get: function () {
                if (this.newContract != null) {
                    if (this.newContract['payment_date'] != null) {
                        return this.newContract.payment_date;
                    }
                }
                return null;
            },
            set: function (payment_date) {
                this.addPaymentDateForContractAction(payment_date);
            }
        },
        editStatus: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['status'] != null) {
                        if (this.contract.status.id !== undefined) {
                            return this.contract.status
                        } else {
                            return this.statusList.filter(s => s.id === this.contract.status)
                        }
                    }
                }
                return null;
            },
            set: function (status) {
                this.editStatusForContractAction(status);
            }
        },
        editStep: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['step'] != null) {
                        if (this.contract.step.id !== undefined) {
                            return this.contract.step
                        } else {
                            return {
                                name: `Step ${this.contract.step}`,
                                id: this.contract.step
                            }
                        }
                    }
                }
                return null;
            },
            set: function (step) {
                this.editStepForContractAction(step);
            }
        },
        editContractType: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['contract_type'] != null) {
                        return this.contract.contract_type;
                    }
                }
                return null;
            },
            set: function (contract_type) {
                this.editContractTypeForContractAction(contract_type);
            }
        },
        editSupplier: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['supplier'] != null) {
                        return this.contract.supplier;
                    }
                }
                return null;
            },
            set: function (supplier) {
                this.editSupplierForContractAction(supplier);
                if (supplier && supplier.address) {
                    this.contract.address = supplier.address;
                }
            }
        },
        editDeadline_from: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['deadline_from'] != null) {
                        return this.contract.deadline_from;
                    }
                }
                return null;
            },
            set: function (deadline_from) {
                this.editDeadlineFromForContractAction(deadline_from);
            }
        },
        editDeadline_to: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['deadline_to'] != null) {
                        return this.contract.deadline_to;
                    }
                }
                return null;
            },
            set: function (deadline_to) {
                this.editDeadlineToForContractAction(deadline_to);
            }
        },
        editCompany: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['company'] != null) {
                        return this.contract.company
                    } else {
                        if (this.contract.responsible_person['department'] != null) {
                            if (this.contract.responsible_person.department['company'] != null) {
                                return this.contract.responsible_person.department.company;
                            }
                        }
                    }
                }
                return null;
            },
            set: function (company) {
                if (company != null) {
                    this.editCompanyForContractAction(company);
                    this.getDepartmentByCompanyId(company.id)
                }
                this.setDepartmentForCompanyEditNullAction()
            }
        },
        editDepartment: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['department'] != null) {
                        return this.contract.department;
                    }
                }
                return null;
            },
            set: function (department) {
                this.editDepartmentForContractAction(department);
                this.getResponsiblePersonsByDepartmentId(department.id)
                this.editResponsiblePersonForContractAction(null)
            }
        },
        editResponsiblePerson: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['responsible_person'] != null) {
                        return this.contract.responsible_person;
                    }
                }
                return null;
            },
            set: function (responsible_person) {
                this.editResponsiblePersonForContractAction(responsible_person);
            }
        },
        editTotalPrice: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['total_price'] != null || this.contract['total_price'] != undefined) {
                        return this.contract.total_price
                    }
                }
            },
            set: function (value) {
                this.editTotalPriceForContractAction(value)
            }
        },
        editUnitPrice: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['unit_price'] != null || this.contract['unit_price'] != undefined) {
                        return this.contract.unit_price
                    }
                }
            },
            set: function (value) {
                this.editUnitPriceForContractAction(value)
            }
        },
        editPaymentDate: {
            get: function () {
                if (this.contract != null) {
                    if (this.contract['payment_date'] != null) {
                        return this.contract.payment_date;
                    }
                }
                return null;
            },
            set: function (payment_date) {
                this.editPaymentDateForContractAction(payment_date);
            }
        },
        user() {
            return this.$store.getters['auth/user']
        },
        rolePermissions() {
            return this.$store.getters['auth/rolePermissions']
        },
        directPermissions() {
            return this.$store.getters['auth/directPermissions']
        },
        files() {
            return this.contract.files.filter(f => f.deleted_at === null);
        },
        filesDeleted() {
            return this.contract.files.filter(f => f.deleted_at !== null);
        },
        filesToDeleted() {
            return this.contract.files_deleted
        },
        searchCompany: {
            get: function () {
                return this.query.search.company
            },
            set: function (value) {
                this.query.search.company = value
                if (value != null) {
                    this.getDepartmentByCompanyId(value.id)
                }
                this.query.search.department = null
                this.query.search.procurement_officer = null
                this.query.search.responsible_person = null
            }
        },
        searchDepartment: {
            get: function () {
                return this.query.search.department
            },
            set: function (value) {
                this.query.search.department = value
                if (value != null) {
                 this.getProcurementOfficerByDepartmentId(value.id)
                    this.getResponsiblePersonsByDepartmentId(value.id)
                }
                this.query.search.procurement_officer = null
                this.query.search.responsible_person = null
            }
        },
        searchProcurementOfficer: {
            get: function () {
                return this.query.search.procurement_officer
            },
            set: function (value) {
                this.query.search.procurement_officer = value
            }
        },
        searchResponsiblePerson: {
            get: function () {
                return this.query.search.responsible_person
            },
            set: function (value) {
                this.query.search.responsible_person = value
            }
        },
        searchContractType: {
            get: function () {
                return this.query.search.contract_type
            },
            set: function (value) {
                this.query.search.contract_type = value
            }
        }
    },
    methods: {
        ...mapActions("contracts", {
            fetchAllContracts: FETCH_ALL_CONTRACTS_ACTION,
            fetchDetailContract: FETCH_DETAIL_CONTRACT_ACTION,
            storeContract: STORE_CONTRACT_ACTION,
            requestContract: "requestContractAction",
            updateContract: UPDATE_CONTRACT_ACTION,
            addContractInput: ADD_CONTRACT_INPUT_ACTION,
            updateContractInput: UPDATE_CONTRACT_INPUT_ACTION,
            deleteContract: DELETE_CONTRACT_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addStepForContractAction: "addStepForContractAction",
            addContractTypeForContractAction: "addContractTypeForContractAction",
            addCompanyForContractAction: "addCompanyForContractAction",
            addDeadlineFromForContractAction: "addDeadlineFromForContractAction",
            addDeadlineToForContractAction: "addDeadlineToForContractAction",
            addResponsiblePersonForContractAction: "addResponsiblePersonForContractAction",
            addTotalPriceForContractAction: "addTotalPriceForContractAction",
            addUnitPriceForContractAction: "addUnitPriceForContractAction",
            addPaymentDateForContractAction: "addPaymentDateForContractAction",
            addDepartmentForContractAction: "addDepartmentForContractAction",
            editStatusForContractAction: "editStatusForContractAction",
            editStepForContractAction: "editStepForContractAction",
            editContractTypeForContractAction: "editContractTypeForContractAction",
            editSupplierForContractAction: "editSupplierForContractAction",
            editCompanyForContractAction: "editCompanyForContractAction",
            editDeadlineFromForContractAction: "editDeadlineFromForContractAction",
            editDeadlineToForContractAction: "editDeadlineToForContractAction",
            editResponsiblePersonForContractAction: "editResponsiblePersonForContractAction",
            editTotalPriceForContractAction: "editTotalPriceForContractAction",
            editUnitPriceForContractAction: "editUnitPriceForContractAction",
            editPaymentDateForContractAction: "editPaymentDateForContractAction",
            editDepartmentForContractAction: "editDepartmentForContractAction",
            getContractAttachments: "getContractAttachments",
            updateContractFilesToDelete: "updateContractFilesToDelete",
            updateContractFilesToRestore: "updateContractFilesToRestore",
            updateContractFilesFromRestoreToDelete: "updateContractFilesFromRestoreToDelete",
            updateContractFilesToRestoreFromDeleted: "updateContractFilesToRestoreFromDeleted",
            updateContractFilesToDeletePermanent: "updateContractFilesToDeletePermanent",
            approveContract: "approveContract",
            resetContractApprove: "resetContractApprove",
            cancelContract: "cancelContract",
            resetContractCancel: "resetContractCancel",
            requestChangesContract: "requestChangesContract",
            reassignContract: "reassignContract",
            fetchContractTimeline: "fetchContractTimeline",
            setDepartmentForCompanyNullAction: "setDepartmentForCompanyNullAction",
            setDepartmentForCompanyEditNullAction: "setDepartmentForCompanyEditNullAction",
            exportContractsToExcel: "exportContractsToExcel",
            addSupplierForContractAction: "addSupplierForContractAction",
        }),
        ...mapActions("contract_types", {
            fetchAllContractTypes: FETCH_ALL_CONTRACT_TYPES_ACTION,
        }),
        ...mapActions("companies", {
            fetchAllCompanies: FETCH_ALL_COMPANIES_ACTION,
        }),
        ...mapActions("users", {
            fetchAllUsers: FETCH_ALL_USERS_ACTION,
        }),
        ...mapActions("departments", {
            fetchAllDepartments: FETCH_ALL_DEPARTMENTS_ACTION,
            getDepartmentByCompanyId: "getDepartmentByCompanyId",
        }),
        ...mapActions("responsible_person", {
            getResponsiblePersonsByDepartmentId: "getResponsiblePersonsByDepartmentId",
        }),
        ...mapActions("procurement_officer", {
            getProcurementOfficerByDepartmentId: "getProcurementOfficerByDepartmentId",
        }),
        ...mapActions("suppliers", {
            fetchAllSuppliers: FETCH_ALL_SUPPLIERS_ACTION,
        }),
        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            this.modalAddActive = false;
            this.modalRequestActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
            this.modalAtthacmentsActive = false;
            this.labelFilesNameInsert = "Choose a file"
            this.labelFilesName = "Choose a file"
            this.labelFilesNameRequest = "Choose a file"
            this.$store.commit('contracts/setNewContractInputNull')
        },
        showAddModal() {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            this.fetchAllContractTypes();
            this.fetchAllCompanies();
            if (this.canShowSuppliers) this.fetchAllSuppliers();
            return this.modalAddActive = !this.modalAddActive;
        },
        showRequestModal() {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            this.fetchAllContractTypes();
            this.fetchAllCompanies();
            if (this.canShowSuppliers) this.fetchAllSuppliers();
            if (this.user.roles !== undefined) {
                if (this.user.roles[0].name == "Procurement Officer") {
                    this.getDepartmentByCompanyId(this.user.department.company.id)
                    this.getResponsiblePersonsByDepartmentId(this.user.department_id)
                }
                else if (this.user.roles[0].name == "Director Department") {
                        this.getDepartmentByCompanyId(this.user.department.company.id)
                        this.getResponsiblePersonsByDepartmentId(this.user.department_id)
                }
                else if (this.user.roles[0].name == "Legal Office") {
                    // If the Legal Office user belongs to a company, pre-select it and load its departments
                    if (this.user.department && this.user.department.company) {
                        const userCompany = this.user.department.company;
                        this.addCompanyForContractAction(userCompany);
                        this.getDepartmentByCompanyId(userCompany.id);
                    } else {
                        // No company on user — show all companies and all departments
                        this.fetchAllDepartments();
                    }
                } else {
                    this.fetchAllDepartments();
                }
            } else {
                this.fetchAllDepartments();
            }
            return this.modalRequestActive = true;
        },
        showInfoModal(id) {
            // Replaced by the modern Workflow Drawer.
            this.openWorkflowDrawer(id);
        },
        async openWorkflowDrawer(id) {
            this.$store.dispatch('ui/setModalActive', true);
            this.workflowDrawerOpen = true;
            this.workflowTimeline = [];
            this.workflowTimelineLoading = true;
            await this.fetchDetailContract(id);
            // Lazy-load users for reassign dropdown when admin opens the drawer.
            const role = this.user && this.user.roles && this.user.roles[0] && this.user.roles[0].name;
            if ((role === 'Super Admin' || role === 'Admin') && (!this.userList || !this.userList.length)) {
                try { await this.fetchAllUsers(); } catch (e) { /* non-fatal */ }
            }
            try {
                this.workflowTimeline = await this.fetchContractTimeline(id);
            } finally {
                this.workflowTimelineLoading = false;
            }
        },
        closeWorkflowDrawer() {
            this.workflowDrawerOpen = false;
            this.$store.dispatch('ui/setModalActive', false);
        },
        setViewMode(mode) {
            this.viewMode = mode;
            try { localStorage.setItem('contracts.viewMode', mode); } catch (e) { /* noop */ }
        },
        async refreshDrawerData(id) {
            this.workflowTimelineLoading = true;
            await this.fetchDetailContract(id);
            try {
                this.workflowTimeline = await this.fetchContractTimeline(id);
            } finally {
                this.workflowTimelineLoading = false;
            }
        },
        async onDrawerApprove(payload) {
            if (!this.contract) return;
            const id = this.contract.id;
            this.workflowDrawerBusy = true;
            try {
                await this.approveContract({ id, comment: payload.comment, file: payload.files && payload.files[0] });
                await this.refreshDrawerData(id);
                await this.fetchAllContracts(this.query);
            } finally {
                this.workflowDrawerBusy = false;
            }
        },
        async onDrawerRequestChanges(payload) {
            if (!this.contract) return;
            const id = this.contract.id;
            this.workflowDrawerBusy = true;
            try {
                await this.requestChangesContract({ id, comment: payload.comment, files: payload.files });
                await this.refreshDrawerData(id);
                await this.fetchAllContracts(this.query);
            } finally {
                this.workflowDrawerBusy = false;
            }
        },
        async onDrawerCancel(payload) {
            if (!this.contract) return;
            const id = this.contract.id;
            this.workflowDrawerBusy = true;
            try {
                await this.cancelContract({ id, comment: payload.comment });
                await this.refreshDrawerData(id);
                await this.fetchAllContracts(this.query);
            } finally {
                this.workflowDrawerBusy = false;
            }
        },
        async onDrawerComment(payload) {
            // Free-form comment + optional attachments. Sent through the
            // contract update endpoint, which now handles comment-only and
            // file-only payloads. `_method=PUT` is required because Laravel's
            // apiResource update route only matches PUT/PATCH.
            if (!this.contract) return;
            const id = this.contract.id;
            const fd = new FormData();
            fd.append("_method", "PUT");
            fd.append("id", id);
            if (payload.comment) fd.append("comment", payload.comment);
            if (payload.files && payload.files.length) {
                Array.from(payload.files).forEach(f => fd.append("files[]", f));
            }
            this.workflowDrawerBusy = true;
            try {
                await this.updateContract(fd);
                await this.refreshDrawerData(id);
            } finally {
                this.workflowDrawerBusy = false;
            }
        },
        async onDrawerReassign(payload) {
            if (!this.contract) return;
            const id = this.contract.id;
            this.workflowDrawerBusy = true;
            try {
                await this.reassignContract({ id, userId: payload.userId, comment: payload.comment });
                await this.refreshDrawerData(id);
                await this.fetchAllContracts(this.query);
            } finally {
                this.workflowDrawerBusy = false;
            }
        },
        onDrawerDownloadFile(file) {
            this.getContractAttachments(file);
        },
        showAttachmentsModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailContract(id);
            this.setErrors(null);
            return this.modalAtthacmentsActive = !this.modalAtthacmentsActive;
        },
        async showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            await this.fetchDetailContract(id);
            this.fetchAllContractTypes();
            this.fetchAllCompanies();
            if (this.canShowSuppliers) this.fetchAllSuppliers();
            if (this.contract != null) {
                // `created_by` can be a user without a department (e.g. Super
                // Admin). Guard every hop so the modal still opens — the
                // department / responsible-person dropdowns will simply be
                // empty until the user picks a company.
                const companyId = this.contract?.created_by?.department?.company?.id;
                if (companyId) {
                    this.getDepartmentByCompanyId(companyId);
                }
                const deptId = this.contract?.created_by?.department?.id;
                if (deptId) {
                    this.getResponsiblePersonsByDepartmentId(deptId);
                }
            }
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addContractInputAction(e) {
            this.addContractInput(e);
        },
        openAddSupplierModal() {
            this.$router.push({ path: '/platform/suppliers', query: { openAdd: 'true' } });
        },
        fetchTemplatesByContractType(contractTypeId) {
            if (!contractTypeId) {
                this.templateList = [];
                this.selectedTemplate = null;
                this.filledTemplateContent = null;
                return;
            }
            ContractTemplateDataService.getByContractType(contractTypeId).then(res => {
                this.templateList = res.data.data || res.data;
            }).catch(() => {
                this.templateList = [];
            });
        },
        onSelectTemplate(template) {
            this.selectedTemplate = template;
            this.filledTemplateContent = null;
            if (template) {
                this.fillSelectedTemplate();
            }
        },
        getTemplateCompany() {
            const { company } = this.newContract;
            if (company) return company;
            // Fallback: user's department company
            if (this.user && this.user.department && this.user.department.company) {
                return this.user.department.company;
            }
            return null;
        },
        getTemplateVariables() {
            const { supplier, deadline_from, deadline_to, address, name, contract_type } = this.newContract;
            const company = this.getTemplateCompany();
            return {
                supplier_name: supplier ? supplier.name : '',
                supplier_address: supplier ? (supplier.address || '') : '',
                supplier_business_number: supplier ? (supplier.bussines_no || '') : '',
                supplier_person: supplier ? ([supplier.contact_name, supplier.contact_surname].filter(Boolean).join(' ')) : '',
                company_name: company ? company.name : '',
                company_business_no: company ? (company.business_no || '') : '',
                company_address: company ? (company.address || '') : '',
                contract_name: name || '',
                contract_type: contract_type ? contract_type.name : '',
                deadline_from: deadline_from || '',
                deadline_to: deadline_to || '',
                responsible_person: this.newContract.responsible_person ? (this.newContract.responsible_person.first_name + ' ' + this.newContract.responsible_person.last_name) : '',
                address: address || '',
                total_price: this.newContract.total_price || '',
                unit_price: this.newContract.unit_price || '',
                payment_terms: this.newContract.payment_terms || '',
                date: new Date().toISOString().split('T')[0],
            };
        },
        fillSelectedTemplate() {
            if (!this.selectedTemplate) return;
            this.isFillingTemplate = true;
            const variables = this.getTemplateVariables();
            const company = this.getTemplateCompany();
            const companyId = company ? company.id : null;
            ContractTemplateDataService.fillTemplate(this.selectedTemplate.id, variables, companyId).then(res => {
                const d = res.data.data || res.data;
                this.filledTemplateContent = d.content || d;
                this.isFillingTemplate = false;
            }).catch(() => {
                this.isFillingTemplate = false;
            });
        },
        downloadFilledTemplate() {
            if (!this.filledTemplateContent || !this.selectedTemplate) return;
            const variables = this.getTemplateVariables();
            const company = this.getTemplateCompany();
            const companyId = company ? company.id : null;
            ContractTemplateDataService.generateFilledDocx(this.selectedTemplate.id, variables, companyId).then(res => {
                const token = res.data.data.download_token;
                const url = ContractTemplateDataService.getDownloadUrl(token);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', res.data.data.filename || 'template_filled.docx');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }).catch(() => {});
        },
        updateContractInputAction(e) {
            this.updateContractInput(e);
        },
        onSubmitAdd() {
            const {
                name,
                contract_type,
                supplier,
                address,
                company,
                deadline_from,
                deadline_to,
                responsible_person,
                total_price,
                unit_price,
                payment_date,
                payment_terms,
                department,
                comment
            } = this.newContract;

            let fd = new FormData();
            fd.append("status", "1");
            // fd.append("step", "1");
            if (name != null) {
                fd.append("name", name);
            }
            if (contract_type != null) {
                fd.append("contract_type_id", contract_type.id);
            }
            if (supplier != null) {
                fd.append("supplier_id", supplier.id);
                fd.append("name_of_contractor", supplier.name);
            }
            if (address != null) {
                fd.append("address", address);
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
            if (department != null) {
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
            if (comment != null) {
                fd.append("comment", comment);
            }
            if (this.$refs.filesInsert.files.length >= 1) {
                Array.from(this.$refs.filesInsert.files).forEach(f => {
                    fd.append("files[]", f);
                });
            }
            if (this.selectNotifyDay != null) {
                fd.append("notify_me", this.selectNotifyDay);
            }

            this.storeContract(fd);
        },
        onSubmitRequest() {
            const {
                step,
                name,
                contract_type,
                supplier,
                address,
                purpose_contractor,
                company,
                deadline_from,
                deadline_to,
                responsible_person,
                total_price,
                unit_price,
                payment_date,
                payment_terms,
                contractor_obligations,
                company_obligations,
                department,
                comment
            } = this.newContract;

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
            if (contract_type != null) {
                fd.append("contract_type_id", contract_type.id);
            }
            if (supplier != null) {
                fd.append("supplier_id", supplier.id);
                fd.append("name_of_contractor", supplier.name);
            }
            if (address != null) {
                fd.append("address", address);
            }
            if (purpose_contractor != null) {
                fd.append("purpose_contractor", purpose_contractor);
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
            if (!department && this.user.roles !== undefined) {
                // Auto-set department from user profile for these roles
                if (this.user.roles[0].name == 'Procurement Officer' || this.user.roles[0].name == 'Director Department') {
                    fd.append("department_id", this.user.department_id);
                }
            } else if (department) {
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
            if (contractor_obligations != null) {
                fd.append("contractor_obligations", contractor_obligations);
            }
            if (company_obligations != null) {
                fd.append("company_obligations", company_obligations);
            }
            if (comment != null) {
                fd.append("comment", comment);
            }
            if (this.$refs.filesRequest.files.length >= 1) {
                Array.from(this.$refs.filesRequest.files).forEach(f => {
                    fd.append("files[]", f);
                });
            }

            // If template was used, generate and attach filled .docx
            if (this.selectedTemplate && this.filledTemplateContent) {
                const tplVariables = this.getTemplateVariables();
                const tplCompany = this.getTemplateCompany();
                const companyId = tplCompany ? tplCompany.id : null;
                ContractTemplateDataService.generateFilledDocx(this.selectedTemplate.id, tplVariables, companyId).then(res => {
                    const token = res.data.data.download_token;
                    fd.append("template_download_token", token);
                    this.requestContract(fd);
                }).catch(() => {
                    this.requestContract(fd);
                });
            } else {
                this.requestContract(fd);
            }
        },
        onSubmitEdit() {
            const {
                id,
                nameNew,
                contract_type,
                supplier,
                addressNew,
                purpose_contractorNew,
                company,
                deadline_from,
                deadline_to,
                responsible_person,
                total_price,
                unit_price,
                payment_date,
                payment_termsNew,
                contractor_obligationsNew,
                company_obligationsNew,
                department,
                status,
                step,
                commentNew,
            } = this.contract;

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
            if (contract_type != null) {
                fd.append("contract_type_id", contract_type.id);
            }
            if (supplier != null) {
                fd.append("supplier_id", supplier.id);
                fd.append("name_of_contractor", supplier.name);
            }
            if (addressNew != null) {
                fd.append("address", addressNew);
            }
            if (purpose_contractorNew != null) {
                fd.append("purpose_contractor", purpose_contractorNew);
            }
            if (company != null) {
                fd.append("company_id", company.id);
            }
            if (deadline_from != null) {
                fd.append("deadline_from", deadline_from);
            }
            fd.append("deadline_to", deadline_to);
            if (deadline_to != null) {
                fd.append("deadline_to", deadline_to);
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
            if (payment_termsNew != null) {
                fd.append("payment_terms", payment_termsNew);
            }
            if (contractor_obligationsNew != null) {
                fd.append("contractor_obligations", contractor_obligationsNew);
            }
            if (company_obligationsNew != null) {
                fd.append("company_obligations", company_obligationsNew);
            }
            if (this.user.roles[0].name == 'Director Department') {
                fd.append("department_id", this.user.department_id);
            }
            if (department != null) {
                fd.append("department_id", department.id);
            }
            if (commentNew != null) {
                fd.append("comment", commentNew);
            }

            this.updateContract(fd);
        },

        onSubmitSaveAttachments() {
            const {
                id,
                files_deleted,
                files_restore,
                files_deleted_permanent,
            } = this.contract;

            let fd = new FormData();
            fd.append("_method", "PUT");
            if (id != null) {
                fd.append("id", id);
            }
            Array.from(this.$refs.filesEdit.files).forEach(f => {
                fd.append("files[]", f);
            });
            if (files_deleted !== undefined) {
                fd.append("files_deleted", JSON.stringify(files_deleted));
            }
            if (files_restore !== undefined) {
                fd.append("files_restore", JSON.stringify(files_restore));
            }
            if (files_deleted_permanent !== undefined) {
                fd.append("files_deleted_permanent", JSON.stringify(files_deleted_permanent));
            }

            this.updateContract(fd);
        },

        async onApprove(id, step) {
            const {value: modalValues, isConfirmed: isConfirmed} = await this.$swal.fire({
                cancelButtonText: this.$t('common.cancel'),
                confirmButtonText: this.$t('common.approve'),
                html: `
                    <label>Approve</label>
                    <textarea aria-label="Add a comment" class="swal2-textarea" placeholder="${this.$t('common.addComment')}" id="swal2-input" style="display: flex;"></textarea>
                    <input style="${step == 6 ? '': 'display:none;'}" type="file" id="approvalFile">
                    <p style="${this.showRequiredMessageForComment ? "color: salmon;": "color: salmon;display:none"}">Comment is required</p>
                    <p style="${this.showRequiredMessageForFile ? "color: salmon;": "color: salmon;display:none"}">File is required</p>
                `,
                preConfirm: () => [
                    document.getElementById("swal2-input").value,
                    document.getElementById("approvalFile").value
                ],
                showCancelButton: true
            })
            if (isConfirmed) {
                if(modalValues[0]){
                    if(step == 6 && !modalValues[1]){
                        this.showRequiredMessageForFile = true
                    }
                    this.approveContract({id: id, comment: modalValues[0], file: modalValues[1]})
                }else{
                    if(step == 6 && !modalValues[1]){
                        this.showRequiredMessageForFile = true
                    }
                    this.showRequiredMessageForComment = true
                    this.onApprove(id, step)
                }
            }
        },
        async onCancel(id) {
            const {value: comment, isConfirmed: isConfirmed} = await this.$swal.fire({
                input: 'textarea',
                inputLabel: 'Cancel',
                cancelButtonText: this.$t('common.cancel'),
                confirmButtonText: this.$t('contracts.cancelContract'),
                confirmButtonColor: '#dc3545',
                inputPlaceholder: this.$t('common.addComment'),
                inputAttributes: {
                    'aria-label': 'Add a comment'
                },
                showCancelButton: true
            })
            if (isConfirmed) {
                if (comment) {
                    this.cancelContract({id: id, comment: comment})
                } else {
                    this.cancelContract({id: id})
                }
            }
        },

        onFileInsert() {
            let files = this.$refs.filesInsert.files
            this.changeFileLabels(files, 'labelFilesNameInsert');
        },

        onFileRequest() {
            let files = this.$refs.filesRequest.files;
            this.changeFileLabels(files, 'labelFilesNameRequest');
        },
        onFileChange() {
            let files = this.$refs.filesEdit.files
            this.changeFileLabels(files, 'labelFilesName');
        },
        changeFileLabels(files, label) {
            this.label = null
            Array.from(files).forEach(f => {
                if (this.label === null) {
                    this.label = f.name
                } else {
                    this.label = this.label + ', ' + f.name
                }
            });
            this[label] = this.label
        },
        showDeleteModal(id) {
            this.$swal
                .fire({
                    text: this.$t('contracts.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('common.yes'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteContract(id);
                        // this.fetchAllTasks();
                        this.fetchAllContracts(this.query)
                        this.$swal.fire({
                            text: this.$t('contracts.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllContracts(this.query);
        },
        getRouteQuery() {
            if (this.$route.query.page != null) {
                this.query.page = parseInt(this.$route.query.page);
            }
            return this.query;
        },
        getStatusId() {
            if(this.$route.query.status != null){
                    // console.log(this.query.search.status.id)
                    this.query.search.status.id = this.$route.query.status;  
                    // console.log(this.query.search.status.id)
            }
             
            return this.query;
        },
        modalContent() {
        },
        checkIfFieldHasErrors(errors, field, loader) {
            if (errors != null && !loader) {
                if (errors[field] != null) {
                    return true;
                }
            }
            return false;
        },
        checkContractStatus(status) {
            // let givenStatus = CONTRACT_STATUS.find(contractStatus => {
            //     return contractStatus.id == status
            // });
            //
            // return givenStatus.value;
            if (status == 1) {
                return "ARCHIVED";
            } else if (status == 2) {
                return "REQUEST";
            } else if (status == 3) {
                return "IN_PROGRESS";
            } else if (status == 4) {
                return "CANCELED";
            } else if (status == 5) {
                return "APPROVED";
            }
        },
        firstAndLastname({first_name, last_name}) {
            if (first_name !== null && last_name !== null) {
                return `${first_name} ${last_name}`
            }
        },
        getContractAttachment(file) {
            return this.getContractAttachments(file);
        },
        showAttachmentIcon(file_extension) {
            if (file_extension == 'docx') {
                return 'fa-file-word';
            } else if (file_extension == 'doc') {
                return 'fa-file-word';
            } else if (file_extension == 'pdf') {
                return 'fa-file-pdf';
            } else if (file_extension == 'xlsx') {
                return 'fa-file-excel';
            } else if (file_extension == 'xls') {
                return 'fa-file-excel';
            } else {
                return '';
            }
        },
        checkIfUserHasPermissionToShowAll() {
            let permission = "Contract Show All";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canShowAll = true;
            }
            if (p2.length >= 1) {
                return this.canShowAll = true;
            }

            return this.canShowAll = false;
        },
        checkIfUserHasPermissionToShow() {
            let permission = "Contract Show";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canShow = true;
            }
            if (p2.length >= 1) {
                return this.canShow = true;
            }

            return this.canShow = false;
        },
        checkIfUserHasPermissionToAdd() {
            let permission = "Contract Add";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canAdd = true;
            }
            if (p2.length >= 1) {
                return this.canAdd = true;
            }

            return this.canAdd = false;
        },
        checkIfUserHasPermissionToRequest() {
            let permission = "Contract Request";
            let currentRolePermissions = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (currentRolePermissions.length >= 1) {
                return this.canRequest = true;
            }
            if (p2.length >= 1) {
                return this.canRequest = true;
            }

            return this.canRequest = false;
        },
        checkIfUserHasPermissionToEdit() {
            let permission = PERMISSIONS.CONTRACT_EDIT;
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canEdit = true;
            }
            if (p2.length >= 1) {
                return this.canEdit = true;
            }

            return this.canEdit = false;
        },
        checkIfUserHasPermissionToDelete() {
            let permission = "Contract Delete";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canDelete = true;
            }
            if (p2.length >= 1) {
                return this.canDelete = true;
            }

            return this.canDelete = false;
        },
        checkIfUserHasPermissionToApprove() {
            let permission = "Contract Approve";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canApprove = true;
            }
            if (p2.length >= 1) {
                return this.canApprove = true;
            }

            return this.canApprove = false;
        },
        checkIfUserHasPermissionToContractAttachments() {
            let permission = "Contract Attachments";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canContractAttachments = true;
            }
            if (p2.length >= 1) {
                return this.canContractAttachments = true;
            }

            return this.canContractAttachments = false;
        },
        checkIfUserHasPermissionToShowSuppliers() {
            let permission = "Supplier Show";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1 || p2.length >= 1) {
                return this.canShowSuppliers = true;
            }
            return this.canShowSuppliers = false;
        },
        checkIfUserHasPermissionToAddSupplier() {
            let permission = "Supplier Add";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1 || p2.length >= 1) {
                return this.canAddSupplier = true;
            }
            return this.canAddSupplier = false;
        },

        clear() {
            this.$refs.filesInsert.value = ""
            this.labelFilesNameInsert = "Choose a file"
        },
        canApproveUser(itemOrStep) {
            // Accept either the full contract row (preferred — uses the
            // workflow template's role mapping) or just a step number for
            // backwards compatibility with the legacy hardcoded chain.
            const role = this.user && this.user.roles && this.user.roles[0] && this.user.roles[0].name;
            if (!role) return false;
            if (role === 'Super Admin') return true;

            // New path: the row has a workflow_template with steps → match by role.
            if (itemOrStep && typeof itemOrStep === 'object') {
                const item = itemOrStep;
                const tpl = item.workflow_template;
                const step = item.step;
                if (tpl && Array.isArray(tpl.steps) && step != null) {
                    const def = tpl.steps.find(s => s.step_order === step);
                    if (def && def.role && def.role.name) {
                        return def.role.name === role;
                    }
                }
                // Fall through to legacy mapping using the step number.
                return this.canApproveUser(step);
            }

            // Legacy hardcoded chain (Director Dept → CEO → Legal → Director Dept → Legal).
            const step = itemOrStep;
            if (step == 7) return false;
            if (role === 'Director Department' && step == 1) return true;
            if (role === 'Executive Director' && step == 2) return true;
            if (role === 'Legal Office'        && step == 3) return true;
            if (role === 'Director Department' && step == 4) return true;
            if (role === 'Legal Office'        && step == 5) return true;
            return false
        },
        printData() {
            const prtHtml = document.getElementById('printTable').outerHTML;
            let stylesHtml = '';
            for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
                stylesHtml += node.outerHTML;
            }
            const WinPrint = window.open();

            WinPrint.document.write(`<!DOCTYPE html>
            <html>
              <head>
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
            this.search = !this.search
            this.fetchAllCompanies()
        },
        onSubmitSearch() {
            this.fetchAllContracts(this.query)
        },
        exportToExcel() {
            this.exportContractsToExcel(this.query)
        },
        giveAccessTo(accessRoles){
            // console.log(accessRoles);
            return canGivenRolesHaveAccess(accessRoles, this.user.roles)
        }
    },
    watch: {
        selectContractType: function(newVal) {
            if (this.modalRequestActive) {
                if (newVal) {
                    this.fetchTemplatesByContractType(newVal.id);
                } else {
                    this.templateList = [];
                    this.selectedTemplate = null;
                    this.filledTemplateContent = null;
                }
            }
        },
        updatedData: function () {
            if (this.updatedData !== null && !this.isUpdating) {
                this.$store.dispatch('ui/setModalActive', false);
                this.$swal.fire({
                    text: this.$t('contracts.updateSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                this.fetchAllContracts(this.query)
                this.labelFilesName = "Choose a file";
                this.modalEditActive = false;
                return this.modalAtthacmentsActive = false;
            }
        },
        createdData: function () {
            if (this.createdData !== null && !this.isCreating) {
                this.$store.dispatch('ui/setModalActive', false);
                // console.log(this.createdData)
                // console.log(this.isCreating)
                this.$swal.fire({
                    text: this.$t('contracts.addSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                this.fetchAllContracts(this.query)
                this.modalAddActive = false;
                return this.modalRequestActive = false;
            }
        },
        contractApprove: function () {
            if (this.contractApprove == "success") {
                this.$swal.fire({
                    text: this.$t('contracts.requestApproved'),
                    icon: "success",
                    timer: 10000,
                });
                this.fetchAllContracts(this.query);
            }
            if (this.contractApprove == "error") {
                this.$swal.fire({
                    text: this.$t('contracts.requestNotApproved'),
                    icon: "error",
                    timer: 10000,
                });
            }
            this.resetContractApprove()
        },
        contractCancel: function () {
            if (this.contractCancel == "success") {
                this.$swal.fire({
                    text: this.$t('contracts.requestCanceled'),
                    icon: "success",
                    timer: 10000,
                });
                this.fetchAllContracts(this.query);
            }
            if (this.contractCancel == "error") {
                this.$swal.fire({
                    text: this.$t('contracts.requestNotCanceled'),
                    icon: "error",
                    timer: 10000,
                });
            }
            this.resetContractCancel()
        },
        contractsPaginatedData: function () {
            let params = this.$route.query;
      
            if(params.status == 5){
                const con = this.contractsPaginatedData.data.filter(({ status }) => status === 5 )
                this.$store.state.contracts.contractsPaginatedData.data = con.filter(({ deadline_to }) => new Date(deadline_to) > new Date())
            }
            if(params.status == 6){
                var date = new Date(); // Now
                date.setDate(date.getDate() + 30);
                const con = this.contractsPaginatedData.data.filter(({ deadline_to }) => new Date(deadline_to) > new Date())
                this.$store.state.contracts.contractsPaginatedData.data = con.filter(({ deadline_to }) => new Date(deadline_to) < date)
            }
            if(params.status == 7){
                const con = this.contractsPaginatedData.data;
                this.$store.state.contracts.contractsPaginatedData.data = con.filter(({ deadline_to }) => new Date(deadline_to) < new Date())
            }
        }
    },
    created() {
        this.checkIfUserHasPermissionToShowAll()
        this.checkIfUserHasPermissionToShow()
        this.checkIfUserHasPermissionToAdd()
        this.checkIfUserHasPermissionToRequest()
        this.checkIfUserHasPermissionToEdit()
        this.checkIfUserHasPermissionToDelete()
        this.checkIfUserHasPermissionToApprove()
        this.checkIfUserHasPermissionToContractAttachments()
        this.checkIfUserHasPermissionToShowSuppliers()
        this.checkIfUserHasPermissionToAddSupplier()
        if (this.canShowAll) {
            let params = this.$route.query;
            if(params.status){
                this.fetchAllContracts(this.getStatusId());
            }
            this.fetchAllContracts(this.getRouteQuery());
            this.fetchAllContractTypes(this.getRouteQuery())
            this.cE = false
        }
    },
}