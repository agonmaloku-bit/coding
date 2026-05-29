import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from '@/Components/vue-multiselect/src';
import {
    USER_LIST_GETTER,
    USERS_PAGINATED_DATA_GETTER,
    USER_GETTER,
    NEW_USER_GETTER,
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

    FETCH_ALL_USERS_ACTION,
    FETCH_DETAIL_USER_ACTION,
    STORE_USER_ACTION,
    UPDATE_USER_ACTION,
    DELETE_USER_ACTION,
    ADD_USER_INPUT_ACTION,
    UPDATE_USER_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/User/constants';
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {FETCH_ALL_PERMISSIONS_ACTION, PERMISSION_LIST_GETTER} from "../../Store/Modules/Permission/constants";
import {useMeta} from "vue-meta";
import {FETCH_ALL_ROLES_ACTION, ROLE_LIST_GETTER} from "../../Store/Modules/Role/constants";
import {COMPANY_LIST_GETTER, FETCH_ALL_COMPANIES_ACTION} from "../../Store/Modules/Company/constants";

export default {
    name: "Users",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Users' })
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
        ...mapGetters('users', {
            user: USER_GETTER,
            newUser: NEW_USER_GETTER,
            userList: USER_LIST_GETTER,
            usersPaginatedData: USERS_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            userDepartmentsGetter: "userDepartmentsGetter",
        }),
        ...mapGetters( 'companies', {
            companyList: COMPANY_LIST_GETTER,
        }),
        ...mapGetters("departments", {
            departmentList: DEPARTMENT_LIST_GETTER,
        }),
        ...mapGetters('roles', {
            roleList: ROLE_LIST_GETTER,
            rolesForDepartmentsGetter: "rolesForDepartmentsGetter",
        }),
        ...mapGetters('permissions', {
            permissionListGetter: PERMISSION_LIST_GETTER,
        }),
        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },
        selectCompany: {
            get: function () {
                if (this.newUser != null) {
                    if (this.newUser['company'] != null) {
                        return this.newUser.company
                    }
                }
            },
            set: function (company) {
                this.addCompanyForNewUserAction(company)
                this.getDepartmentByCompanyId(company.id)
                this.setDepartmentForCompanyNullAction()
            }
        },
        selecteNewDepartments: {
            get: function () {
                if (this.newUser != null) {
                    if (this.newUser['departments'] != null) {
                        return this.newUser.departments;
                    }
                }
                return null;
            },
            set: function (departments) {
                //let depIds = departments.map(a => a.id);
                if (departments != null) {
                    this.addDepartmentsForNewUserAction(departments);
                }
            }
        },

        selectedRoles: {
            get: function () {
                if (this.newUser != null) {
                    if (this.newUser['roles'] != null) {
                        return this.newUser.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForNewUserAction(roles);
            }
        },
        selecteCustomPermissions: {
            get: function () {
                if (this.newUser != null) {
                    if (this.newUser['permissions'] != null) {
                        return this.newUser.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForNewUserAction(permissions);
            }
        },
        editCompany: {
            get: function () {
                if (this.user != null) {
                    if (this.user['company'] != null) {
                        return this.user.company
                    }
                }
            },
            set: function (company) {
                if (company != null) {
                    this.addCompanyForEditUserAction(company)
                    this.getDepartmentByCompanyId(company.id)
                    this.setDepartmentForCompanyEditNullAction()
                }
            }
        },
        editDepartmentsForCurrentUser: {
            get: function () {
                if (this.user != null) {
                    if (this.user['department'] != null) {
                        return this.user.department;
                    }
                }
                return null;
            },
            set: function (department) {
                this.addDepartmentsForEditUserAction(department);
            }
        },
        editRolesForCurrentUser: {
            get: function () {
                if (this.user != null) {
                    if (this.user['roles'] != null) {
                        return this.user.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForEditUserAction(roles);
            }
        },
        editCustomPermissions: {
            get: function () {
                console.log(this.user.permissions);
                if (this.user != null) {
                    if (this.user['permissions'] != null) {
                        return this.user.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForEditUserAction(permissions);
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
        ...mapActions("users", {
            fetchAllUsers: FETCH_ALL_USERS_ACTION,
            fetchDetailUser: FETCH_DETAIL_USER_ACTION,
            storeUser: STORE_USER_ACTION,
            updateUser: UPDATE_USER_ACTION,
            addUserInput: ADD_USER_INPUT_ACTION,
            updateUserInput: UPDATE_USER_INPUT_ACTION,
            deleteUser: DELETE_USER_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addCompanyForNewUserAction: "addCompanyForNewUserAction",
            addDepartmentsForNewUserAction: "addDepartmentsForNewUserAction",
            addRolesForNewUserAction: "addRolesForNewUserAction",
            addCustomPermissionsForNewUserAction: "addCustomPermissionsForNewUserAction",
            addDepartmentsForEditUserAction: "addDepartmentsForEditUserAction",
            addRolesForEditUserAction: "addRolesForEditUserAction",
            setRolesForUserNullAction: "setRolesForUserNullAction",
            addCustomPermissionsForEditUserAction: "addCustomPermissionsForEditUserAction",
            setDepartmentForCompanyNullAction: "setDepartmentForCompanyNullAction",
            addCompanyForEditUserAction: "addCompanyForEditUserAction",
            setDepartmentForCompanyEditNullAction: "setDepartmentForCompanyEditNullAction",
        }),
        ...mapActions("companies", {
            fetchAllCompanies: FETCH_ALL_COMPANIES_ACTION,
        }),
        ...mapActions("departments", {
            fetchAllDepartments: FETCH_ALL_DEPARTMENTS_ACTION,
            getDepartmentByCompanyId: "getDepartmentByCompanyId",
        }),
        ...mapActions("roles", {
            fetchAllRoles: FETCH_ALL_ROLES_ACTION,
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
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchAllCompanies()
            this.fetchAllRoles()
            this.fetchAllPermissionsAction();
            this.setErrors(null);
            return this.modalAddActive = !this.modalAddActive;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailUser(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailUser(id).then(() => {
                this.getDepartmentByCompanyId(this.user.company.id)
            });
            this.fetchAllCompanies();
            this.fetchAllRoles()
            this.fetchAllPermissionsAction();
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addUserInputAction(e) {
            this.addUserInput(e);
        },
        updateUserInputAction(e) {
            this.updateUserInput(e);
        },
        onSubmitAdd() {
            const {
                first_name,
                last_name,
                email,
                password,
                password_confirmation,
                company,
                departments,
                roles,
                permissions
            } = this.newUser;
            this.storeUser({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                password_confirmation: password_confirmation,
                company_id: company != null ? company.id : null,
                department_id: departments != null ? departments.id : null,
                roles: roles,
                permissions: this.customPermissions === true ? permissions : "",
            });
        },
        onSubmitEdit() {
            const user = this.user;
            const first_name = user.first_nameNew != null ? user.first_nameNew : user.first_name;
            const last_name = user.last_nameNew != null ? user.last_nameNew : user.last_name;
            const email = user.emailNew != null ? user.emailNew : user.email;
            const department = user.department;
            const roles = user.roles;
            const password = user.passwordNew;
            const password_confirmation = user.password_confirmationNew;
            const permissions = user.permissions;
            if (password && password_confirmation) {
                this.updateUser({
                    id: user.id,
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
                this.updateUser({
                    id: user.id,
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
                    text: this.$t('users.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('common.yes'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteUser(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: this.$t('users.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllUsers(this.query);
        },
        getRouteQuery() {
            if (this.$route.query.page != null) {
                this.query.page = parseInt(this.$route.query.page);
            }
            return this.query;
        },
        modalContent() {
        },
        checkIfFieldHasErrors(errors, field) {
            if (errors != null && !this.isCreating) {
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
            let permission = "Users Show All";
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
            let permission = "Users Show";
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
            let permission = "Users Add";
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
            let permission = "Users Edit";
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
            let permission = "Users Delete";
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
                this.$store.dispatch('ui/setModalActive', false);
                this.$swal.fire({
                    text: this.$t('users.updateSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                return this.modalEditActive = false;
            }
        },
        createdData: function () {
            if (this.createdData !== null && !this.isCreating) {
                this.$store.dispatch('ui/setModalActive', false);
                // console.log(this.createdData)
                // console.log(this.isCreating)
                this.$swal.fire({
                    text: this.$t('users.addSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                // this.clear()
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
            this.fetchAllUsers(this.getRouteQuery())
        }
    },
}