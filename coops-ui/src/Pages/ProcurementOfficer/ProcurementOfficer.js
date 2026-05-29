import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from '@/Components/vue-multiselect/src';
// import "vue-multiselect/dist/vue-multiselect.css";
import {
    PROCUREMENT_OFFICER_LIST_GETTER,
    PROCUREMENT_OFFICERS_PAGINATED_DATA_GETTER,
    PROCUREMENT_OFFICER_GETTER,
    NEW_PROCUREMENT_OFFICER_GETTER,
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

    FETCH_ALL_PROCUREMENT_OFFICERS_ACTION,
    FETCH_DETAIL_PROCUREMENT_OFFICER_ACTION,
    STORE_PROCUREMENT_OFFICER_ACTION,
    UPDATE_PROCUREMENT_OFFICER_ACTION,
    DELETE_PROCUREMENT_OFFICER_ACTION,
    ADD_PROCUREMENT_OFFICER_INPUT_ACTION,
    UPDATE_PROCUREMENT_OFFICER_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/ProcurementOfficer/constants';
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {FETCH_ALL_PERMISSIONS_ACTION, PERMISSION_LIST_GETTER} from "../../Store/Modules/Permission/constants";
import {useMeta} from "vue-meta";

export default {
    name: "ProcurementOfficers",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Procurement Officer' })
    },
    data() {
        return {
            modalAddActive: false,
            modalInfoActive: false,
            modalEditActive: false,
            query: {
                page: 1,
            },
            customPermissions: false,
            customEditPermissions: false,
            canShowAll: false,
            canShow: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
        }
    },
    computed: {
        ...mapGetters('procurement_officer', {
            procurement_officer: PROCUREMENT_OFFICER_GETTER,
            newProcurementOfficer: NEW_PROCUREMENT_OFFICER_GETTER,
            procurement_officerList: PROCUREMENT_OFFICER_LIST_GETTER,
            procurement_officersPaginatedData: PROCUREMENT_OFFICERS_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            procurement_officerDepartmentsGetter: "procurementOfficerDepartmentsGetter",
        }),

        ...mapGetters("departments", {
            departmentList: DEPARTMENT_LIST_GETTER,
        }),

        ...mapGetters('roles', {
            roleByNameForDepartmentsGetter: "roleByNameForDepartmentsGetter",
        }),

        ...mapGetters('permissions', {
            permissionListGetter: PERMISSION_LIST_GETTER,
        }),

        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },

        selecteNewDepartments: {
            get: function () {
                if (this.newProcurementOfficer != null) {
                    if (this.newProcurementOfficer['departments'] != null) {
                        return this.newProcurementOfficer.departments;
                    }
                }
                return null;
            },
            set: function (departments) {
                //let depIds = departments.map(a => a.id);
                this.addDepartmentsForNewProcurementOfficerAction(departments);
                this.getRoleByNameForDepartments({id: departments.id, slug: 'procurement_officer'});
                this.setRolesForDepartmentsNullAction();
                this.addRolesForNewProcurementOfficerAction([]);
            }
        },

        selectedRolesForDepartments: {
            get: function () {
                if (this.newProcurementOfficer != null) {
                    if (this.newProcurementOfficer['roles'] != null) {
                        return this.newProcurementOfficer.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForNewProcurementOfficerAction(roles);
            }
        },
        selecteCustomPermissions: {
            get: function () {
                if (this.newProcurementOfficer != null) {
                    if (this.newProcurementOfficer['permissions'] != null) {
                        return this.newProcurementOfficer.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForNewProcurementOfficerAction(permissions);
            }
        },
        editDepartmentsForCurrentProcurementOfficer: {
            get: function () {
                if (this.procurement_officer != null) {
                    if (this.procurement_officer['department'] != null) {
                        return this.procurement_officer.department;
                    }
                }
                return null;
            },
            set: function (department) {
                this.addDepartmentsForEditProcurementOfficerAction(department);
                this.getRoleByNameForDepartments({id: department.id, slug: 'procurement_officer'});
                this.setRolesForDepartmentsNullAction();
                this.setRolesForProcurementOfficerNullAction();
            }
        },
        editRolesForCurrentProcurementOfficer: {
            get: function () {
                if (this.procurement_officer != null) {
                    if (this.procurement_officer['roles'] != null) {
                        this.getRoleByNameForDepartments({
                            id: this.procurement_officer.department.id,
                            slug: 'procurement_officer'
                        });
                        return this.procurement_officer.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForEditProcurementOfficerAction(roles);
            }
        },
        editCustomPermissions: {
            get: function () {
                if (this.procurement_officer != null) {
                    if (this.procurement_officer['permissions'] != null) {
                        return this.procurement_officer.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForEditProcurementOfficerAction(permissions);
            }
        },
        rolePermissions() {
            return this.$store.getters['auth/rolePermissions']
        },
        directPermissions() {
            return this.$store.getters['auth/directPermissions']
        }
    },
    methods: {
        ...mapActions("procurement_officer", {
            fetchAllProcurementOfficers: FETCH_ALL_PROCUREMENT_OFFICERS_ACTION,
            fetchDetailProcurementOfficer: FETCH_DETAIL_PROCUREMENT_OFFICER_ACTION,
            storeProcurementOfficer: STORE_PROCUREMENT_OFFICER_ACTION,
            updateProcurementOfficer: UPDATE_PROCUREMENT_OFFICER_ACTION,
            addProcurementOfficerInput: ADD_PROCUREMENT_OFFICER_INPUT_ACTION,
            updateProcurementOfficerInput: UPDATE_PROCUREMENT_OFFICER_INPUT_ACTION,
            deleteProcurementOfficer: DELETE_PROCUREMENT_OFFICER_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addDepartmentsForNewProcurementOfficerAction: "addDepartmentsForNewProcurementOfficerAction",
            addRolesForNewProcurementOfficerAction: "addRolesForNewProcurementOfficerAction",
            addCustomPermissionsForNewProcurementOfficerAction: "addCustomPermissionsForNewProcurementOfficerAction",
            addDepartmentsForEditProcurementOfficerAction: "addDepartmentsForEditProcurementOfficerAction",
            addRolesForEditProcurementOfficerAction: "addRolesForEditProcurementOfficerAction",
            setRolesForProcurementOfficerNullAction: "setRolesForProcurementOfficerNullAction",
            addCustomPermissionsForEditProcurementOfficerAction: "addCustomPermissionsForEditProcurementOfficerAction",
        }),

        ...mapActions("departments", {
            fetchAllDepartments: FETCH_ALL_DEPARTMENTS_ACTION,
        }),

        ...mapActions("roles", {
            getRoleByNameForDepartments: "getRoleByNameForDepartments",
            setRolesForDepartmentsNullAction: "setRolesForDepartmentsNullAction",
        }),

        ...mapActions("permissions", {
            fetchAllPermissionsAction: FETCH_ALL_PERMISSIONS_ACTION,
        }),

        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
        },

        showAddModal() {
            this.fetchAllDepartments();
            this.fetchAllPermissionsAction();
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            return this.modalAddActive = !this.modalAddActive;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailProcurementOfficer(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailProcurementOfficer(id);
            this.fetchAllDepartments();
            this.fetchAllPermissionsAction();
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addProcurementOfficerInputAction(e) {
            this.addProcurementOfficerInput(e);
        },
        updateProcurementOfficerInputAction(e) {
            this.updateProcurementOfficerInput(e);
        },
        onSubmitAdd() {
            const {
                first_name,
                last_name,
                email,
                password,
                password_confirmation,
                departments,
                roles,
                permissions
            } = this.newProcurementOfficer;
            this.storeProcurementOfficer({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                password_confirmation: password_confirmation,
                department_id: departments != null ? departments.id : null,
                roles: roles,
                permissions: this.customPermissions === true ? permissions : "",
            });
        },
        onSubmitEdit() {
            const po = this.procurement_officer;
            const first_name = po.first_nameNew != null ? po.first_nameNew : po.first_name;
            const last_name = po.last_nameNew != null ? po.last_nameNew : po.last_name;
            const email = po.emailNew != null ? po.emailNew : po.email;
            const department = po.department;
            const roles = po.roles;
            const password = po.passwordNew;
            const password_confirmation = po.password_confirmationNew;
            const permissions = po.permissions;
            if (password != null || password_confirmation != null) {
                this.updateProcurementOfficer({
                    id: po.id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password,
                    password_confirmation: password_confirmation,
                    department_id: department != null ? department.id : null,
                    roles: roles != null ? roles : null,
                    permissions: permissions,
                });
            } else {
                this.updateProcurementOfficer({
                    id: po.id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    department_id: department != null ? department.id : null,
                    roles: roles != null ? roles : null,
                    permissions: permissions,
                });
            }
        },

        showDeleteModal(id) {
            this.$swal
                .fire({
                    text: this.$t('procurementOfficer.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('procurementOfficer.confirmDelete'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteProcurementOfficer(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: this.$t('procurementOfficer.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllProcurementOfficers(this.query);
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
        editCustomPermissionsTrueOrFalse(value) {
            this.customEditPermissions = value;
        },
        checkIfUserHasPermissionToShowAll() {
            let permission = "Procurement Officer Show All";
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
            let permission = "Procurement Officer Show";
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
            let permission = "Procurement Officer Add";
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
            let permission = "Procurement Officer Edit";
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
            let permission = "Procurement Officer Delete";
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
                    text: this.$t('procurementOfficer.updateSuccess'),
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
                    text: this.$t('procurementOfficer.addSuccess'),
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
            this.fetchAllProcurementOfficers(this.getRouteQuery())
        }
    },
}