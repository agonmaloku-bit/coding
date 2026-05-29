import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VueMultiselect from "@/Components/vue-multiselect/src";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import {
    DEPARTMENT_LIST_GETTER,
    DEPARTMENTS_PAGINATED_DATA_GETTER,
    DEPARTMENT_GETTER,
    NEW_DEPARTMENT_GETTER,
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

    FETCH_ALL_DEPARTMENTS_ACTION,
    FETCH_DETAIL_DEPARTMENT_ACTION,
    STORE_DEPARTMENT_ACTION,
    UPDATE_DEPARTMENT_ACTION,
    DELETE_DEPARTMENT_ACTION,
    ADD_DEPARTMENT_INPUT_ACTION,
    UPDATE_DEPARTMENT_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/Department/constants';
import {useMeta} from "vue-meta";
import {COMPANY_LIST_GETTER, FETCH_ALL_COMPANIES_ACTION} from "../../Store/Modules/Company/constants";

export default {
    name: "Departments",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VueMultiselect,
        VPagination,
    },
    setup () {
        useMeta({ title: 'Departments' })
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
        ...mapGetters('departments', {
            department: DEPARTMENT_GETTER,
            newDepartment: NEW_DEPARTMENT_GETTER,
            departmentList: DEPARTMENT_LIST_GETTER,
            departmentsPaginatedData: DEPARTMENTS_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
        }),
        ...mapGetters( 'companies', {
            companyList: COMPANY_LIST_GETTER,
        }),
        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },
        rolePermissions() {
            return this.$store.getters['auth/rolePermissions']
        },
        directPermissions() {
            return this.$store.getters['auth/directPermissions']
        },
        selectCompany: {
            get: function () {
                if (this.newDepartment != null) {
                    if (this.newDepartment['company'] != null) {
                        return this.newDepartment.company;
                    }
                }
                return null;
            },
            set: function (company) {
                this.addCompanyForDepartmentAction(company);
            }
        },
        editCompany: {
            get: function () {
                if (this.department != null) {
                    if (this.department['company'] != null) {
                        return this.department.company;
                    }
                }
                return null;
            },
            set: function (company) {
                this.editCompanyForDepartmentAction(company);
            }
        },
    },
    methods: {
        ...mapActions("departments", {
            fetchAllDepartments: FETCH_ALL_DEPARTMENTS_ACTION,
            fetchDetailDepartment: FETCH_DETAIL_DEPARTMENT_ACTION,
            storeDepartment: STORE_DEPARTMENT_ACTION,
            updateDepartment: UPDATE_DEPARTMENT_ACTION,
            addDepartmentInput: ADD_DEPARTMENT_INPUT_ACTION,
            updateDepartmentInput: UPDATE_DEPARTMENT_INPUT_ACTION,
            deleteDepartment: DELETE_DEPARTMENT_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addCompanyForDepartmentAction: "addCompanyForDepartmentAction",
            editCompanyForDepartmentAction: "editCompanyForDepartmentAction",
        }),

        ...mapActions("companies", {
            fetchAllCompanies: FETCH_ALL_COMPANIES_ACTION,
        }),

        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
            this.clear()
        },

        showAddModal() {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            this.fetchAllCompanies()
            return this.modalAddActive = !this.modalAddActive;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailDepartment(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            // this.$store.dispatch('departments/setErrors', null);
            this.fetchDetailDepartment(id);
            this.fetchAllCompanies()
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addDepartmentInputAction(e) {
            this.addDepartmentInput(e);
        },
        updateDepartmentInputAction(e) {
            this.updateDepartmentInput(e);
        },
        onSubmitAdd() {
            const {
                name,
                company
            } = this.newDepartment;
            this.storeDepartment({
                name: name,
                company_id: company !== undefined ? company.id : null
            });
        },
        onSubmitEdit() {
            const {id, name, company, nameNew} = this.department;
            let department = [];
            department['id'] = id
            if (name !== nameNew) {
                department['name'] = nameNew
            }
            if (company !== undefined) {
                department['company_id'] = company.id
            }
            this.updateDepartment({ ...department });
        },

        showDeleteModal(id) {
            this.$swal
                .fire({
                    text: "Are you sure you want to delete this department?",
                    icon: "error",
                    cancelButtonText: "Cancel",
                    confirmButtonText: "Yes",
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteDepartment(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: "Department has been deleted.",
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllDepartments(this.query);
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
            let permission = "Departments Show All";
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
            let permission = "Departments Show";
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
            let permission = "Departments Add";
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
            let permission = "Departments Edit";
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
            let permission = "Departments Delete";
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
        clear() {
            this.$refs.name.value = ""
        }
    },
    watch: {
        updatedData: function () {
            if (this.updatedData !== null && !this.isUpdating) {
                this.$store.dispatch('ui/setModalActive', !this.isModalActive);
                this.$swal.fire({
                    text: "Department has been updated successfully!",
                    icon: "success",
                    timer: 10000,
                });

                return this.modalEditActive = !this.modalEditActive;
            }
        },
        createdData: function () {
            if (this.createdData !== null && !this.isCreating) {
                this.$store.dispatch('ui/setModalActive', false);
                // console.log(this.createdData)
                // console.log(this.isCreating)
                this.$swal.fire({
                    text: "Department has been added successfully!",
                    icon: "success",
                    timer: 10000,
                });

                this.clear()
                return this.modalAddActive = false;
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
            this.fetchAllDepartments(this.getRouteQuery());
        }
    },
}