import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from '@/Components/vue-multiselect/src';
import {
    DIRECTOR_DEPARTMENT_LIST_GETTER,
    DIRECTOR_DEPARTMENTS_PAGINATED_DATA_GETTER,
    DIRECTOR_DEPARTMENT_GETTER,
    NEW_DIRECTOR_DEPARTMENT_GETTER,
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

    FETCH_ALL_DIRECTOR_DEPARTMENTS_ACTION,
    FETCH_DETAIL_DIRECTOR_DEPARTMENT_ACTION,
    STORE_DIRECTOR_DEPARTMENT_ACTION,
    UPDATE_DIRECTOR_DEPARTMENT_ACTION,
    DELETE_DIRECTOR_DEPARTMENT_ACTION,
    ADD_DIRECTOR_DEPARTMENT_INPUT_ACTION,
    UPDATE_DIRECTOR_DEPARTMENT_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/DirectorDepartment/constants';
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {FETCH_ALL_PERMISSIONS_ACTION, PERMISSION_LIST_GETTER} from "../../Store/Modules/Permission/constants";
import {useMeta} from "vue-meta";

export default {
    name: "DirectorDepartments",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Director of Departments' })
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
        ...mapGetters('director_department', {
            director_department: DIRECTOR_DEPARTMENT_GETTER,
            newDirectorDepartment: NEW_DIRECTOR_DEPARTMENT_GETTER,
            director_departmentList: DIRECTOR_DEPARTMENT_LIST_GETTER,
            director_departmentsPaginatedData: DIRECTOR_DEPARTMENTS_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            director_departmentDepartmentsGetter: "directorDepartmentDepartmentsGetter",
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
                if (this.newDirectorDepartment != null) {
                    if (this.newDirectorDepartment['departments'] != null) {
                        return this.newDirectorDepartment.departments;
                    }
                }
                return null;
            },
            set: function (departments) {
                //let depIds = departments.map(a => a.id);
                this.addDepartmentsForNewDirectorDepartmentAction(departments);
                this.getRoleByNameForDepartments({ id: departments.id, slug: 'director_department'});
                this.setRolesForDepartmentsNullAction();
                this.addRolesForNewDirectorDepartmentAction([]);
            }
        },

        selectedRolesForDepartments: {
            get: function () {
                if (this.newDirectorDepartment != null) {
                    if (this.newDirectorDepartment['roles'] != null) {
                        return this.newDirectorDepartment.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForNewDirectorDepartmentAction(roles);
            }
        },
        selecteCustomPermissions: {
            get: function () {
                if (this.newDirectorDepartment != null) {
                    if (this.newDirectorDepartment['permissions'] != null) {
                        return this.newDirectorDepartment.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForNewDirectorDepartmentAction(permissions);
            }
        },
        editDepartmentsForCurrentDirectorDepartment: {
            get: function () {
                if (this.director_department != null) {
                    if (this.director_department['department'] != null) {
                        return this.director_department.department;
                    }
                }
                return null;
            },
            set: function (department) {
                this.addDepartmentsForEditDirectorDepartmentAction(department);
                this.getRoleByNameForDepartments({ id: department.id, slug: 'director_department'});
                this.setRolesForDepartmentsNullAction();
                this.setRolesForDirectorDepartmentNullAction();
            }
        },
        editRolesForCurrentDirectorDepartment: {
            get: function () {
                if (this.director_department != null) {
                    if (this.director_department['roles'] != null) {
                        this.getRoleByNameForDepartments({ id: this.director_department.department.id, slug: 'director_department'});
                        return this.director_department.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForEditDirectorDepartmentAction(roles);
            }
        },
        editCustomPermissions: {
            get: function () {
                if (this.director_department != null) {
                    if (this.director_department['permissions'] != null) {
                        return this.director_department.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForEditDirectorDepartmentAction(permissions);
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
        ...mapActions("director_department", {
            fetchAllDirectorDepartments: FETCH_ALL_DIRECTOR_DEPARTMENTS_ACTION,
            fetchDetailDirectorDepartment: FETCH_DETAIL_DIRECTOR_DEPARTMENT_ACTION,
            storeDirectorDepartment: STORE_DIRECTOR_DEPARTMENT_ACTION,
            updateDirectorDepartment: UPDATE_DIRECTOR_DEPARTMENT_ACTION,
            addDirectorDepartmentInput: ADD_DIRECTOR_DEPARTMENT_INPUT_ACTION,
            updateDirectorDepartmentInput: UPDATE_DIRECTOR_DEPARTMENT_INPUT_ACTION,
            deleteDirectorDepartment: DELETE_DIRECTOR_DEPARTMENT_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addDepartmentsForNewDirectorDepartmentAction: "addDepartmentsForNewDirectorDepartmentAction",
            addRolesForNewDirectorDepartmentAction: "addRolesForNewDirectorDepartmentAction",
            addCustomPermissionsForNewDirectorDepartmentAction: "addCustomPermissionsForNewDirectorDepartmentAction",
            addDepartmentsForEditDirectorDepartmentAction: "addDepartmentsForEditDirectorDepartmentAction",
            addRolesForEditDirectorDepartmentAction: "addRolesForEditDirectorDepartmentAction",
            setRolesForDirectorDepartmentNullAction: "setRolesForDirectorDepartmentNullAction",
            addCustomPermissionsForEditDirectorDepartmentAction: "addCustomPermissionsForEditDirectorDepartmentAction",
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
            this.fetchDetailDirectorDepartment(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailDirectorDepartment(id);
            this.fetchAllDepartments();
            this.fetchAllPermissionsAction();
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addDirectorDepartmentInputAction(e) {
            this.addDirectorDepartmentInput(e);
        },
        updateDirectorDepartmentInputAction(e) {
            this.updateDirectorDepartmentInput(e);
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
            } = this.newDirectorDepartment;
            this.storeDirectorDepartment({
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
            const dd = this.director_department;
            const first_name = dd.first_nameNew != null ? dd.first_nameNew : dd.first_name;
            const last_name = dd.last_nameNew != null ? dd.last_nameNew : dd.last_name;
            const email = dd.emailNew != null ? dd.emailNew : dd.email;
            const department = dd.department;
            const roles = dd.roles;
            const password = dd.passwordNew;
            const password_confirmation = dd.password_confirmationNew;
            const permissions = dd.permissions;
            if (password != null || password_confirmation != null) {
                this.updateDirectorDepartment({
                    id: dd.id,
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
                this.updateDirectorDepartment({
                    id: dd.id,
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
                    text: this.$t('directorDepartment.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('directorDepartment.confirmDelete'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteDirectorDepartment(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: this.$t('directorDepartment.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllDirectorDepartments(this.query);
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
            let permission = "Director Department Show All";
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
            let permission = "Director Department Show";
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
            let permission = "Director Department Add";
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
            let permission = "Director Department Edit";
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
            let permission = "Director Department Delete";
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
                    text: this.$t('directorDepartment.updateSuccess'),
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
                    text: this.$t('directorDepartment.addSuccess'),
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
            this.fetchAllDirectorDepartments(this.getRouteQuery());
        }
    },
}