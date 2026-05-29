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
    LEGAL_OFFICE_LIST_GETTER,
    LEGAL_OFFICES_PAGINATED_DATA_GETTER,
    LEGAL_OFFICE_GETTER,
    NEW_LEGAL_OFFICE_GETTER,
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

    FETCH_ALL_LEGAL_OFFICES_ACTION,
    FETCH_DETAIL_LEGAL_OFFICE_ACTION,
    STORE_LEGAL_OFFICE_ACTION,
    UPDATE_LEGAL_OFFICE_ACTION,
    DELETE_LEGAL_OFFICE_ACTION,
    ADD_LEGAL_OFFICE_INPUT_ACTION,
    UPDATE_LEGAL_OFFICE_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/LegalOffice/constants';
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {FETCH_ALL_PERMISSIONS_ACTION, PERMISSION_LIST_GETTER} from "../../Store/Modules/Permission/constants";
import {useMeta} from "vue-meta";

export default {
    name: "LegalOffices",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Legal office' })
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
        ...mapGetters('legal_office', {
            legal_office: LEGAL_OFFICE_GETTER,
            newLegalOffice: NEW_LEGAL_OFFICE_GETTER,
            legal_officeList: LEGAL_OFFICE_LIST_GETTER,
            legal_officesPaginatedData: LEGAL_OFFICES_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            legal_officeDepartmentsGetter: "legalOfficeDepartmentsGetter",
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
                if (this.newLegalOffice != null) {
                    if (this.newLegalOffice['departments'] != null) {
                        return this.newLegalOffice.departments;
                    }
                }
                return null;
            },
            set: function (departments) {
                //let depIds = departments.map(a => a.id);
                this.addDepartmentsForNewLegalOfficeAction(departments);
                this.getRoleByNameForDepartments({ id: departments.id, slug: 'legal_office'});
                this.setRolesForDepartmentsNullAction();
                this.addRolesForNewLegalOfficeAction([]);
            }
        },

        selectedRolesForDepartments: {
            get: function () {
                if (this.newLegalOffice != null) {
                    if (this.newLegalOffice['roles'] != null) {
                        return this.newLegalOffice.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForNewLegalOfficeAction(roles);
            }
        },
        selecteCustomPermissions: {
            get: function () {
                if (this.newLegalOffice != null) {
                    if (this.newLegalOffice['permissions'] != null) {
                        return this.newLegalOffice.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForNewLegalOfficeAction(permissions);
            }
        },
        editDepartmentsForCurrentLegalOffice: {
            get: function () {
                if (this.legal_office != null) {
                    if (this.legal_office['department'] != null) {
                        return this.legal_office.department;
                    }
                }
                return null;
            },
            set: function (department) {
                this.addDepartmentsForEditLegalOfficeAction(department);
                this.getRoleByNameForDepartments({ id: department.id, slug: 'legal_office'});
                this.setRolesForDepartmentsNullAction();
                this.setRolesForLegalOfficeNullAction();
            }
        },
        editRolesForCurrentLegalOffice: {
            get: function () {
                if (this.legal_office != null) {
                    if (this.legal_office['roles'] != null) {
                        this.getRoleByNameForDepartments({ id: this.legal_office.department.id, slug: 'legal_office'});
                        return this.legal_office.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForEditLegalOfficeAction(roles);
            }
        },
        editCustomPermissions: {
            get: function () {
                if (this.legal_office != null) {
                    if (this.legal_office['permissions'] != null) {
                        return this.legal_office.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForEditLegalOfficeAction(permissions);
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
        ...mapActions("legal_office", {
            fetchAllLegalOffices: FETCH_ALL_LEGAL_OFFICES_ACTION,
            fetchDetailLegalOffice: FETCH_DETAIL_LEGAL_OFFICE_ACTION,
            storeLegalOffice: STORE_LEGAL_OFFICE_ACTION,
            updateLegalOffice: UPDATE_LEGAL_OFFICE_ACTION,
            addLegalOfficeInput: ADD_LEGAL_OFFICE_INPUT_ACTION,
            updateLegalOfficeInput: UPDATE_LEGAL_OFFICE_INPUT_ACTION,
            deleteLegalOffice: DELETE_LEGAL_OFFICE_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addDepartmentsForNewLegalOfficeAction: "addDepartmentsForNewLegalOfficeAction",
            addRolesForNewLegalOfficeAction: "addRolesForNewLegalOfficeAction",
            addCustomPermissionsForNewLegalOfficeAction: "addCustomPermissionsForNewLegalOfficeAction",
            addDepartmentsForEditLegalOfficeAction: "addDepartmentsForEditLegalOfficeAction",
            addRolesForEditLegalOfficeAction: "addRolesForEditLegalOfficeAction",
            setRolesForLegalOfficeNullAction: "setRolesForLegalOfficeNullAction",
            addCustomPermissionsForEditLegalOfficeAction: "addCustomPermissionsForEditLegalOfficeAction",
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
            this.fetchDetailLegalOffice(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailLegalOffice(id);
            this.fetchAllDepartments();
            this.fetchAllPermissionsAction();
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addLegalOfficeInputAction(e) {
            this.addLegalOfficeInput(e);
        },
        updateLegalOfficeInputAction(e) {
            this.updateLegalOfficeInput(e);
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
            } = this.newLegalOffice;
            this.storeLegalOffice({
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
            const lo = this.legal_office;
            const first_name = lo.first_nameNew != null ? lo.first_nameNew : lo.first_name;
            const last_name = lo.last_nameNew != null ? lo.last_nameNew : lo.last_name;
            const email = lo.emailNew != null ? lo.emailNew : lo.email;
            const department = lo.department;
            const roles = lo.roles;
            const password = lo.passwordNew;
            const password_confirmation = lo.password_confirmationNew;
            const permissions = lo.permissions;
            if (password != null || password_confirmation != null) {
                this.updateLegalOffice({
                    id: lo.id,
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
                this.updateLegalOffice({
                    id: lo.id,
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
                    text: this.$t('legalOffice.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('legalOffice.confirmDelete'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteLegalOffice(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: this.$t('legalOffice.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllLegalOffices(this.query);
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
            let permission = "Legal Office Show All";
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
            let permission = "Legal Office Show";
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
            let permission = "Legal Office Add";
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
            let permission = "Legal Office Edit";
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
            let permission = "Legal Office Delete";
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
                    text: this.$t('legalOffice.updateSuccess'),
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
                    text: this.$t('legalOffice.addSuccess'),
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
            this.fetchAllLegalOffices(this.getRouteQuery())
        }
    },
}