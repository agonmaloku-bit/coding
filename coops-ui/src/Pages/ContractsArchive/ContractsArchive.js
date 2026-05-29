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
} from '@/Store/Modules/ContractArchive/constants';
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

export default {
    name: "ContractsArchive",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
        flatPickr,
        "app-currency-input": CurrencyInput
    },
    setup() {
        useMeta({title: 'Archive Contracts'})
    },
    data() {
        return {
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
                    contract_type: null,
                }
            },
            selectNotifyDay: null,
            editNotifyDay: null,
            search: false,
            daysList: [ '15', '30', '45', '60', '90', '120', '160', '180' ],
            statusList: [
                {name: "ARCHIVED", id: 1},
                {name: "SKADUAR", id: 99},
                // {name: "IN PROGRESS", id: 3},
                // {name: "CANCELED", id: 4},
                // {name: "APPROVED", id: 5},
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
                {name: "ARCHIVED", id: 1},
                {name: "SKADUAR", id: 99},
                // {name: "IN PROGRESS", id: 3},
                // {name: "CANCELED", id: 4},
                // {name: "APPROVED", id: 5},
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
                // { id: 'created_by', name: 'Created by' },
                // { id: 'department_id', name: 'By Department' },
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
            labelFilesNameInsert: "Choose a file",
            labelFilesName: "Choose a file",
            labelFilesNameRequest: "Choose a file",
            clicked: false,
            // canApproveUser: false,
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

        isModalActive() {
            return this.$store.getters['ui/modalActive'];
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
                return null;
            },
            set: function (responsible_person) {
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
            fetchAllArchiveContracts: "fetchAllArchiveContracts",
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
            setDepartmentForCompanyNullAction: "setDepartmentForCompanyNullAction",
            setDepartmentForCompanyEditNullAction: "setDepartmentForCompanyEditNullAction",
            exportContractsToExcel: "exportContractsToExcel",
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
            return this.modalAddActive = !this.modalAddActive;
        },
        showRequestModal() {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            this.fetchAllContractTypes();
            this.fetchAllCompanies();
            if (this.user.roles !== undefined) {
                if (this.user.roles[0].name == "Procurement Officer") {
                    this.getDepartmentByCompanyId(this.user.department.company.id)
                    this.getResponsiblePersonsByDepartmentId(this.user.department_id)
                } else {
                    this.fetchAllDepartments();
                }
            } else {
                this.fetchAllDepartments();
            }
            return this.modalRequestActive = true;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailContract(id);
            return this.modalInfoActive = !this.modalInfoActive;
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
            if (this.contract != null) {
                this.getDepartmentByCompanyId(this.contract.created_by.department.company.id)
                this.getResponsiblePersonsByDepartmentId(this.contract.created_by.department.id)
            }
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addContractInputAction(e) {
            this.addContractInput(e);
        },
        updateContractInputAction(e) {
            this.updateContractInput(e);
        },
        onSubmitAdd() {
            const {
                name,
                contract_type,
                name_of_contractor,
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
            if (name_of_contractor != null) {
                fd.append("name_of_contractor", name_of_contractor);
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
                name_of_contractor,
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
                fd.append("step", "1");
            }
            if (step === undefined) {
                fd.append("step", "1");
            }
            if (name != null) {
                fd.append("name", name);
            }
            if (contract_type != null) {
                fd.append("contract_type_id", contract_type.id);
            }
            if (name_of_contractor != null) {
                fd.append("name_of_contractor", name_of_contractor);
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
            if (department === undefined && this.user.roles !== undefined) {
                console.log(this.user.roles[0].name)
                if (this.user.roles[0].name == 'Procurement Officer') {
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
            if (contractor_obligations != null) {
                fd.append("contractor_obligations", contractor_obligations);
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
                Array.from(this.$refs.filesRequest.files).forEach(f => {
                    fd.append("files[]", f);
                });
            }

            this.requestContract(fd);
        },
        onSubmitEdit() {
            const {
                id,
                nameNew,
                contract_type,
                name_of_contractorNew,
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
            if (name_of_contractorNew != null) {
                fd.append("name_of_contractor", name_of_contractorNew);
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

        async onApprove(id) {
            const {value: comment, isConfirmed: isConfirmed} = await this.$swal.fire({
                input: 'textarea',
                inputLabel: 'Approve',
                cancelButtonText: this.$t('common.cancel'),
                confirmButtonText: this.$t('common.approve'),
                inputPlaceholder: this.$t('common.addComment'),
                inputAttributes: {
                    'aria-label': 'Add a comment'
                },
                showCancelButton: true
            })
            if (isConfirmed) {
                if (comment) {
                    this.approveContract({id: id, comment: comment})
                } else {
                    this.approveContract({id: id})
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
                        this.fetchAllArchiveContracts(this.query)
                        this.$swal.fire({
                            text: this.$t('contracts.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllArchiveContracts(this.query);
        },
        getRouteQuery() {
            if (this.$route.query.page != null) {
                this.query.page = parseInt(this.$route.query.page);
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

        clear() {
            this.$refs.filesInsert.value = ""
            this.labelFilesNameInsert = "Choose a file"
        },
        canApproveUser(step) {
            if (this.user.roles[0].name == 'Super Admin') {
                return true
            }
            if (this.user.roles[0].name == 'Director Department' && step == 1) {
                return true
            }
            if (this.user.roles[0].name == 'Executive Director' && step == 2) {
                return true
            }
            if (this.user.roles[0].name == 'Legal Office' && step == 3) {
                return true
            }
            if (this.user.roles[0].name == 'Procurement Officer' && step == 4) {
                return true
            }
            if (this.user.roles[0].name == 'Legal Office' && step == 5) {
                return true
            }
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
            this.fetchAllArchiveContracts(this.query)
        },
        exportToExcel() {
            this.exportContractsToExcel(this.query)
        },
    },
    watch: {
        updatedData: function () {
            if (this.updatedData !== null && !this.isUpdating) {
                this.$store.dispatch('ui/setModalActive', false);
                this.$swal.fire({
                    text: this.$t('contracts.updateSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                this.fetchAllArchiveContracts(this.query)
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

                this.fetchAllArchiveContracts(this.query)
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
                this.fetchAllArchiveContracts(this.query);
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
                this.fetchAllArchiveContracts(this.query);
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
        if (this.canShowAll) {
            this.fetchAllArchiveContracts(this.getRouteQuery());
            this.fetchAllContractTypes(this.getRouteQuery())
        }
        // this.canApproveUserMeth()
    },
}