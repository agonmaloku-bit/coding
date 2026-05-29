import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import { mapGetters, mapActions } from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from "@/Components/vue-multiselect/src";
import {COMPANY_LIST_GETTER, FETCH_ALL_COMPANIES_ACTION} from "../../Store/Modules/Company/constants";
import {
    CONTRACT_TYPE_LIST_GETTER,
    CONTRACT_TYPES_PAGINATED_DATA_GETTER,
    CONTRACT_TYPE_GETTER,
    NEW_CONTRACT_TYPE_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    IS_CREATING_GETTER,
    CREATED_DATA_GETTER,
    IS_UPDATING_GETTER,
    UPDATED_DATA_GETTER,
    // IS_DELETING_GETTER,
    // DELETED_DATA_GETTER,
    ERRORS_GETTER,

    FETCH_ALL_CONTRACT_TYPES_ACTION,
    FETCH_DETAIL_CONTRACT_TYPE_ACTION,
    STORE_CONTRACT_TYPE_ACTION,
    UPDATE_CONTRACT_TYPE_ACTION,
    DELETE_CONTRACT_TYPE_ACTION,
    ADD_CONTRACT_TYPE_INPUT_ACTION,
    UPDATE_CONTRACT_TYPE_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/ContractType/constants';
import {useMeta} from "vue-meta";

export default {
    name: "ContractTypes",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Contract Types' })
    },
    data() {
        return {
            modalAddActive: false,
            modalInfoActive: false,
            modalEditActive: false,
            query: {
                page: 1,
            },
            canShowAll: false,
            canShow: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
        }
    },
    computed: {
        ...mapGetters( 'contract_types', {
            contract_type: CONTRACT_TYPE_GETTER,
            newContractType: NEW_CONTRACT_TYPE_GETTER,
            contract_typeList: CONTRACT_TYPE_LIST_GETTER,
            contract_typesPaginatedData: CONTRACT_TYPES_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER
        }),
        ...mapGetters('companies', {
            companyList: COMPANY_LIST_GETTER,
        }),
        selectCompany: {
            get: function () {
                if (this.newContractType != null && this.newContractType['company'] != null) {
                    return this.newContractType.company;
                }
                return null;
            },
            set: function (company) {
                this.addCompanyForContractTypeAction(company);
            }
        },
        editCompany: {
            get: function () {
                if (this.contract_type != null && this.contract_type['company'] != null) {
                    return this.contract_type.company;
                }
                return null;
            },
            set: function (company) {
                this.editCompanyForContractTypeAction(company);
            }
        },
        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },
        rolePermissions() {
            return this.$store.getters['auth/rolePermissions']
        },
        directPermissions() {
            return this.$store.getters['auth/directPermissions']
        }
    },
    methods: {
        ...mapActions("contract_types", {
            fetchAllContractTypes: FETCH_ALL_CONTRACT_TYPES_ACTION,
            fetchDetailContractType: FETCH_DETAIL_CONTRACT_TYPE_ACTION,
            storeContractType: STORE_CONTRACT_TYPE_ACTION,
            updateContractType: UPDATE_CONTRACT_TYPE_ACTION,
            addContractTypeInput: ADD_CONTRACT_TYPE_INPUT_ACTION,
            updateContractTypeInput: UPDATE_CONTRACT_TYPE_INPUT_ACTION,
            deleteContractType: DELETE_CONTRACT_TYPE_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addCompanyForContractTypeAction: "addCompanyForContractTypeAction",
            editCompanyForContractTypeAction: "editCompanyForContractTypeAction",
        }),
        ...mapActions("companies", {
            fetchAllCompanies: FETCH_ALL_COMPANIES_ACTION,
        }),

        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
        },

        showAddModal() {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            this.fetchAllCompanies();
            return this.modalAddActive = !this.modalAddActive;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailContractType(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailContractType(id);
            this.setErrors(null);
            this.fetchAllCompanies();
            return this.modalEditActive = !this.modalEditActive;
        },
        addContractTypeInputAction(e) {
            this.addContractTypeInput(e);
        },
        updateContractTypeInputAction(e) {
            this.updateContractTypeInput(e);
        },
        onSubmitAdd() {
            const { name, company } = this.newContractType;
            let data = { name: name };
            if (company != null) {
                data.company_id = company.id;
            }
            this.storeContractType(data);
        },
        onSubmitEdit() {
            const { id, name, nameNew, company } = this.contract_type;
            let contract_type = [];
            contract_type['id'] = id
            if (name !== nameNew) {
                contract_type['name'] = nameNew
            }
            if (company != null) {
                contract_type['company_id'] = company.id
            }
            this.updateContractType({ ...contract_type });
        },

        showDeleteModal(id) {
            this.$swal
                .fire({
                    text: this.$t('contractTypes.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('common.yes'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteContractType(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: this.$t('contractTypes.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllContractTypes(this.query);
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
        checkIfUserHasPermissionToShowAll() {
            let permission = "Contract Type Show All";
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
            let permission = "Contract Type Show";
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
            let permission = "Contract Type Add";
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
        checkIfUserHasPermissionToEdit() {
            let permission = "Contract Type Edit";
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
            let permission = "Contract Type Delete";
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
    },
    watch: {
        updatedData: function () {
            if (this.updatedData !== null && !this.isUpdating) {
                this.$store.dispatch('ui/setModalActive', !this.isModalActive);
                this.$swal.fire({
                    text: this.$t('contractTypes.updateSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                return this.modalEditActive = !this.modalEditActive;
            }
        },
        createdData: function () {
            if (this.createdData !== null && !this.isCreating) {
                this.$store.dispatch('ui/setModalActive', !this.isModalActive);
                // console.log(this.createdData)
                // console.log(this.isCreating)
                this.$swal.fire({
                    text: this.$t('contractTypes.addSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                return this.modalAddActive = !this.modalAddActive;
            }
        },
    },
    created() {
        this.checkIfUserHasPermissionToShowAll()
        this.checkIfUserHasPermissionToShow()
        this.checkIfUserHasPermissionToAdd()
        this.checkIfUserHasPermissionToEdit()
        this.checkIfUserHasPermissionToDelete()
        if (this.canShowAll) {
            this.fetchAllContractTypes(this.getRouteQuery())
        }
    },
}